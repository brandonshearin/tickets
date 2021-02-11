import { Publisher, OrderCreatedEvent, Subjects } from "@bscommon/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
