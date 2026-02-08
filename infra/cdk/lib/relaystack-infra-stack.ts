import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export class RelayStackInfraStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly ecsCluster: ecs.Cluster;
  public readonly rdsInstance: rds.DatabaseInstance;
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly ecrRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==================== VPC ====================
    this.vpc = new ec2.Vpc(this, "RelayStackVpc", {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // ==================== SECURITY GROUPS ====================
    const albSecurityGroup = new ec2.SecurityGroup(this, "AlbSecurityGroup", {
      vpc: this.vpc,
      description: "Security group for Application Load Balancer",
      allowAllOutbound: true,
    });
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP"
    );
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allow HTTPS"
    );

    const ecsSecurityGroup = new ec2.SecurityGroup(this, "EcsSecurityGroup", {
      vpc: this.vpc,
      description: "Security group for ECS Fargate tasks",
      allowAllOutbound: true,
    });
    ecsSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(8080),
      "Allow traffic from ALB"
    );

    const dbSecurityGroup = new ec2.SecurityGroup(this, "DbSecurityGroup", {
      vpc: this.vpc,
      description: "Security group for RDS PostgreSQL",
      allowAllOutbound: true,
    });
    dbSecurityGroup.addIngressRule(
      ecsSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow PostgreSQL from ECS"
    );

    // ==================== RDS POSTGRESQL ====================
    const dbCredentials = new secretsmanager.Secret(this, "DbCredentials", {
      secretName: "relaystack/db-credentials",
      description: "RelayStack RDS PostgreSQL credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "relaystack" }),
        generateStringKey: "password",
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    this.rdsInstance = new rds.DatabaseInstance(this, "RelayStackDb", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(dbCredentials),
      databaseName: "relaystack",
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageEncrypted: true,
      multiAz: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      publiclyAccessible: false,
    });

    // ==================== JWT SECRET ====================
    const jwtSecret = new secretsmanager.Secret(this, "JwtSecret", {
      secretName: "relaystack/jwt-secret",
      description: "JWT signing secret for RelayStack auth",
      generateSecretString: {
        excludePunctuation: true,
        passwordLength: 64,
      },
    });

    // ==================== ECR REPOSITORY ====================
    this.ecrRepository = new ecr.Repository(this, "GatewayRepo", {
      repositoryName: "relaystack-gateway",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 10,
          description: "Keep only 10 images",
        },
      ],
    });

    // ==================== ECS CLUSTER ====================
    this.ecsCluster = new ecs.Cluster(this, "RelayStackCluster", {
      vpc: this.vpc,
      clusterName: "relaystack-cluster",
    });

    // ==================== APPLICATION LOAD BALANCER ====================
    this.alb = new elbv2.ApplicationLoadBalancer(this, "RelayStackAlb", {
      vpc: this.vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      loadBalancerName: "relaystack-alb",
    });

    const listener = this.alb.addListener("HttpListener", {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    // ==================== ECS TASK DEFINITION ====================
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "GatewayTaskDef",
      {
        memoryLimitMiB: 1024,
        cpu: 512,
      }
    );

    // Grant secrets access
    dbCredentials.grantRead(taskDefinition.taskRole);
    jwtSecret.grantRead(taskDefinition.taskRole);

    // Build DATABASE_URL from secret components
    const dbHost = this.rdsInstance.dbInstanceEndpointAddress;
    const dbPort = this.rdsInstance.dbInstanceEndpointPort;
    const dbName = "relaystack";

    const container = taskDefinition.addContainer("GatewayContainer", {
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository, "20260205212731"),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "gateway",
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: "production",
        PORT: "8080",
        AWS_REGION: cdk.Aws.REGION,
        DB_HOST: dbHost,
        DB_PORT: dbPort,
        DB_NAME: dbName,
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "*",
      },
      secrets: {
        DB_USERNAME: ecs.Secret.fromSecretsManager(dbCredentials, "username"),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(dbCredentials, "password"),
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
      },
      portMappings: [
        {
          containerPort: 8080,
          protocol: ecs.Protocol.TCP,
        },
      ],
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    // ==================== ECS SERVICE ====================
    const service = new ecs.FargateService(this, "GatewayService", {
      cluster: this.ecsCluster,
      taskDefinition,
      desiredCount: 1,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      assignPublicIp: false,
      serviceName: "relaystack-gateway",
      circuitBreaker: {
        rollback: true,
      },
      minHealthyPercent: 0,
      maxHealthyPercent: 200,
    });

    // ==================== AUTO SCALING ====================
    const scaling = service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // ==================== ALB TARGET GROUP ====================
    listener.addTargets("GatewayTarget", {
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: "/health",
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // ==================== OUTPUTS ====================
    new cdk.CfnOutput(this, "VpcId", {
      value: this.vpc.vpcId,
      description: "VPC ID",
      exportName: "RelayStackVpcId",
    });

    new cdk.CfnOutput(this, "AlbDnsName", {
      value: this.alb.loadBalancerDnsName,
      description: "Application Load Balancer DNS Name",
      exportName: "RelayStackAlbDns",
    });

    new cdk.CfnOutput(this, "AlbUrl", {
      value: `http://${this.alb.loadBalancerDnsName}`,
      description: "Gateway API URL",
      exportName: "RelayStackGatewayUrl",
    });

    new cdk.CfnOutput(this, "EcrRepositoryUri", {
      value: this.ecrRepository.repositoryUri,
      description: "ECR Repository URI",
      exportName: "RelayStackEcrUri",
    });

    new cdk.CfnOutput(this, "RdsEndpoint", {
      value: this.rdsInstance.dbInstanceEndpointAddress,
      description: "RDS PostgreSQL Endpoint",
      exportName: "RelayStackRdsEndpoint",
    });

    new cdk.CfnOutput(this, "RdsSecretArn", {
      value: dbCredentials.secretArn,
      description: "RDS Credentials Secret ARN",
      exportName: "RelayStackRdsSecretArn",
    });

    new cdk.CfnOutput(this, "JwtSecretArn", {
      value: jwtSecret.secretArn,
      description: "JWT Secret ARN",
      exportName: "RelayStackJwtSecretArn",
    });

    new cdk.CfnOutput(this, "ClusterName", {
      value: this.ecsCluster.clusterName,
      description: "ECS Cluster Name",
      exportName: "RelayStackClusterName",
    });

    new cdk.CfnOutput(this, "ServiceName", {
      value: service.serviceName,
      description: "ECS Service Name",
      exportName: "RelayStackServiceName",
    });

    new cdk.CfnOutput(this, "DatabaseUrl", {
      value: `postgresql://\${DB_USERNAME}:\${DB_PASSWORD}@${dbHost}:${dbPort}/${dbName}`,
      description: "Database URL template (replace with actual credentials)",
      exportName: "RelayStackDatabaseUrlTemplate",
    });
  }
}
