import { EVENT_TYPE } from "@prisma/client";
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ async: false })
export class IsEventTypeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return Object.values(EVENT_TYPE).includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return "type must be a valid EVENT_TYPE: EVENT, FOCUS_TIME, OUT_OF_OFFICE, WORKING_LOCATION, TASK, APPOINTMENT_SCHEDULE, MEETING";
  }
}

export function IsEventType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEventTypeConstraint,
    });
  };
}
