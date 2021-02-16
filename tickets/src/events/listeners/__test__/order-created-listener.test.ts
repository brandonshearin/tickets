import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@bscommon/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // create an instance of the listner
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    price: 10,
    title: "concert",
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  // create the fake data event
  const data: OrderCreatedEvent["data"] = {
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    userId: "lbah asbh",
    orderId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "asdf",
    status: OrderStatus.Created,
  };

  // create the fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the userId of the ticket ", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const reservedTicket = await Ticket.findById(ticket.id);

  expect(reservedTicket.orderId).toEqual(data.orderId);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // as jest.Mock tells TS that publish is actually a jest mock fn.
  // this is so we don't have to do a @ts-ignore
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedData.orderId).toEqual(data.orderId);
});
