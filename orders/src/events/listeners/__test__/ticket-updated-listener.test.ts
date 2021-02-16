import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@bscommon/common";
import { Message } from "node-nats-streaming";
const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticketId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    price: 10,
    title: "concert",
  });
  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticketId,
    price: 20,
    title: "concert",
    version: ticket.version + 1,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  // return
  return { listener, data, msg };
};

it("finds, updates, and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // assert that ticket has been updated
  const ticket = await Ticket.findById(data.id);
  expect(ticket!.price).toEqual(20);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a version number that isnt +1", async () => {
  const { listener, data, msg } = await setup();

  data.version = 10

  try {
    await listener.onMessage(data, msg);
  } catch (err){

  }
  

  expect(msg.ack).not.toHaveBeenCalled();
});
