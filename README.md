# @thundra/cdk-alarm-creator
## Target Group Based Alarm Creator for AWS CDK

This package provides Constructs for creating a Target Group based CloudWatch alarms for your applications. It'll look up target group ids while creating an alarm and sets `4XX` and `5XX` alarms for those applications.

In it's current stage, the CDK is pretty simple and basic. We're planning to make this package as modular as possible to meet our custom CloudWatch alarm needs in the future.

-----

## About CDK Compatibility

`@thundra/cdk-alarm-creator` is currently only supported to CDK v2.

## Installation

### npm

```shell
npm i @thundra/cdk-alarm-creator
```

## Example

```typescript
import * as thundra from '@thundra/cdk-alarm-creator';

// ...

export class AlarmStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // ...

        new thundra.CloudWatchAlarmCreator(this, `my-app-target-group-alarms`, {
            prefix: '<PREFIX_FOR_CFN_RESOURCES>',
            postfix: '<POSTFIX_FOR_CFN_RESOURCES>',
            stage: '<APPLICATION_STAGE_POSTFIX>',
            applicationName: '<APPLICATION_NAME>',
            elbArn: '<ELB_ARN>',
            threshold4xx: '<4XX_THRESHOLD>',
            threshold5xx: '<5XX_THRESHOLD>',
            alarmTopics: [
                '<SNS_TOPIC_ARN>',
            ]
        });
    }
}

```

## Constructs

### CloudWatchAlarmCreator

#### Initializer

```typescript
new CloudWatchAlarmCreator(scope: cdk.Construct, id: string, props: CloudWatchAlarmCreatorProps);
```

#### Construct Props

```typescript
export interface CloudWatchAlarmCreatorProps {
    /**
     * Prefix to be used to name custom resources.
     */
    readonly prefix?: string;
    /**
     * Postfix to be used to name custom resources.
     */
    readonly postfix?: string;
    /**
     * Application name without the stage postfix.
     * e.g. foresight-api-backend
     */
    readonly applicationName: string;
    /**
     * Application stage postfix. Will be merged with
     * `applicationName` automatically.
     * e.g. lab
     */
    readonly stage: string;
    /**
     * The ARN of the ELB that target groups are added.
     */
    readonly elbArn: string;
    /**
     * Threshold for the 4XX percentage.
     */
    readonly threshold4xx: number,
    /**
     * Threshold for the 5XX percentage.
     */
    readonly threshold5xx: number,
    /**
     * The ARN of the SNS Topics that'll be triggered
     * when the alarm sets on or off.
     */
    readonly alarmTopics: string[];
}
```

## Licensing

@thundra/cdk-alarm-creator is licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full license text.
