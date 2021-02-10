import { Publisher, Subjects, TicketCreatedEvent } from "@bscommon/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
