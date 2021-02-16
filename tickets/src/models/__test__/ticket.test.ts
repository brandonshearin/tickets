import { Ticket } from "../ticket";

it("implements optimistic concurreny control", async (done) => {
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  // save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance.set({ price: 10 });
  secondInstance.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance.save();

  // save the second fetched ticket (which will have an outdated version number)
  try {
    await secondInstance.save();
  } catch (err) {
    done();
    return; // success!
  }
  // interop issues with jest and TS, so we need to wrap our throwing call in a try/catch and
  // manually throw an error
  throw new Error("should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert",
    userId: "1234",
    price: 20,
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
