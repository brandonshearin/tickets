import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@bscommon/common";
import { Ticket } from "../../models/ticket";

import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    // findByEvent is a helper for finding a ticket by id and version
    const ticket = await Ticket.findByEvent(data);

    // TODO: Address error handling
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const { title, price } = data;
    ticket.set({ title, price });

    await ticket.save();

    msg.ack();
  }
}
