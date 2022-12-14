import { Handler, CloudFormationCustomResourceEvent } from "aws-lambda";

import { CustomResourceHandler } from "./handler";
import { CloudWatchAlarmCreateHandler } from "./handler/cloudwatch-alarm-creator/create";
import { CloudWatchAlarmUpdateHandler } from "./handler/cloudwatch-alarm-creator/update";
import { CloudWatchAlarmDeleteHandler } from "./handler/cloudwatch-alarm-creator/delete";

const cloudWatchAlarmCreator: Handler = async (event: CloudFormationCustomResourceEvent) => {
    const handler: CustomResourceHandler = (() => {
        console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));
        switch (event.RequestType) {
            case "Create":
                return new CloudWatchAlarmCreateHandler(event);
            case "Update":
                return new CloudWatchAlarmUpdateHandler(event);
            case "Delete":
                return new CloudWatchAlarmDeleteHandler(event);
        }
    })();

    return handler.handleEvent();
}

export const handler = cloudWatchAlarmCreator;
