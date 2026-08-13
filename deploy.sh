#!/usr/bin/env bash
# Automated Google Cloud Run Deployment Script
# All Things Agentic Hackathon

PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="bureaucracy-buster"
REGION="us-central1"

echo "========================================================"
echo "🚀 Deploying Bureaucracy Buster to Google Cloud Run"
echo "Project ID: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "========================================================"

# Enable required GCP APIs
echo "Enabling required APIs (Cloud Run, Cloud Build)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Deploy to Cloud Run
echo "Building container image and deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"

echo "========================================================"
echo "✅ Deployment complete!"
echo "Service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
echo "========================================================"
