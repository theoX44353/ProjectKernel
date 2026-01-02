import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Basic tracing initialization. Import this module as early as possible in the app.
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const serviceName = process.env.OTEL_SERVICE_NAME || 'docker-mcp-server';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

const exporter = new OTLPTraceExporter({ url: otlpEndpoint });

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName,
});

sdk.start()
  .then(() => {
    console.info('OpenTelemetry tracing initialized');
  })
  .catch((err) => {
    console.error('Error starting OpenTelemetry SDK', err);
  });

process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    console.info('Tracing SDK shut down');
  } catch (err) {
    console.error('Error shutting down tracing SDK', err);
  }
});

export {};
