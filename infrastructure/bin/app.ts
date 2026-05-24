#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductsApiStack, ProductsApiStackProps } from "../lib/products_api_stack";
import { ImportProductStack, ImportApiStackProps } from "../lib/import_product_stack";

const app = new cdk.App();

// Resolve environment from context
const envName = app.node.tryGetContext("env") ?? "dev";
const envConfig = getEnvConfig(envName);

// Deploy stack
new ProductsApiStack(app, `ProductsApiStack-${envName}`, {
  envName,
  ...envConfig,
});

new ImportProductStack(app, `ImportProductStack-${envName}`, {
  envName,
  ...envConfig,
});

app.synth();

// Environment configuration
function getEnvConfig(envName: string): Partial<ProductsApiStackProps> {
  const configs: Record<string, Partial<ProductsApiStackProps>> = {
    dev: {
      enableTracing: false,
    },
    staging: {
      enableTracing: true,
    },
    prod: {
      enableTracing: true,
    },
  };
  return configs[envName] ?? configs["dev"];
}
