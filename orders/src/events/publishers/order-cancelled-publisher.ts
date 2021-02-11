import { Subjects, Publisher, OrderCancelledEvent } from "@bscommon/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
