// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ThundraCdkAlarmCreatorProps {
  // Define construct properties here
}

export class ThundraCdkAlarmCreator extends Construct {

  constructor(scope: Construct, id: string, props: ThundraCdkAlarmCreatorProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'ThundraCdkAlarmCreatorQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
