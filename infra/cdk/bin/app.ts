#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { RelayStackInfraStack } from "../lib/relaystack-infra-stack";

const app = new cdk.App();

// Get environment from context or use defaults
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || "us-east-1",
};

new RelayStackInfraStack(app, "RelayStackInfra", {
  env,
  description: "RelayStack AI Gateway Infrastructure - Cognito, RDS, ElastiCache, S3",
});
