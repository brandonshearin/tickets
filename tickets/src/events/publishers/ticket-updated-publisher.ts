import { Publisher, Subjects, TicketUpdatedEvent } from "@bscommon/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
