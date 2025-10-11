import { readRuntimeEnvironment } from './environment.utils';

export const environment = {
  production: true,
  supabaseUrl: readRuntimeEnvironment('NG_APP_SUPABASE_URL'),
  supabaseAnonKey: readRuntimeEnvironment('NG_APP_SUPABASE_ANON_KEY'),
  oneSignalAppId: readRuntimeEnvironment('NG_APP_ONESIGNAL_APP_ID'),
  awsSnsTopicArn: readRuntimeEnvironment('NG_APP_AWS_SNS_TOPIC_ARN')
};
