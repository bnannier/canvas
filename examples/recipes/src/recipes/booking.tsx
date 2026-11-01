import { useRef, useState } from "react";
import { type TextInput } from "react-native";
import { Alert, Badge, Button, Card, Column, DescriptionList, Field, Form, Grid, Input, Radio, RadioGroup, Row, Select, Typography } from "@nannier/canvas";
import { validEmail } from "./settings";

const services = [
  { value: "consultation", label: "Design consultation · 30 min", price: "$45", duration: "30 minutes" },
  { value: "workshop", label: "Creative workshop · 60 min", price: "$80", duration: "60 minutes" },
];
// Dates are generated from the device's local date. No timezone conversion or server availability is implied.
const upcomingDates = () => Array.from({ length: 5 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  return { value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`, label: date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) };
});
type Reservation = { service: string; date: string; time: string; name: string; email: string };
export function useBooking() {
  const [dates] = useState(upcomingDates);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [notice, setNotice] = useState("");
  const slots = service === "workshop" ? ["10:00 AM", "1:00 PM", "3:00 PM"] : ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"];
  const changeService = (value: string) => { setService(value); setTime(""); setNotice(""); };
  const changeDate = (value: string) => { setDate(value); setTime(""); setNotice(""); };
  const errors = {
    service: attempted && !services.some((item) => item.value === service) ? "Choose a service." : undefined,
    date: attempted && !dates.some((item) => item.value === date) ? "Choose an appointment date." : undefined,
    time: attempted && !slots.includes(time) ? "Choose a time slot." : undefined,
    name: attempted && name.trim().length < 2 ? "Enter your name (at least two characters)." : undefined,
    email: attempted && !validEmail(email.trim()) ? "Enter a valid contact email." : undefined,
  };
  const confirm = () => {
    setAttempted(true);
    if (!service || !date || !slots.includes(time) || name.trim().length < 2 || !validEmail(email.trim())) return false;
    setReservation({ service, date, time, name: name.trim(), email: email.trim() }); setAttempted(false); setNotice("");
    return true;
  };
  const reset = () => { setService(""); setDate(""); setTime(""); setName(""); setEmail(""); setAttempted(false); setNotice("Booking draft cleared."); };
  const cancelReservation = () => { setReservation(null); setTime(""); setNotice("Sample reservation cancelled. Choose another time to book again."); };
  return { dates, service, date, time, name, email, attempted, reservation, notice, slots, changeService, changeDate, setTime, setName, setEmail, errors, confirm, reset, cancelReservation };
}

export function Booking({ model }: { model: ReturnType<typeof useBooking> }) {
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const selectedService = services.find((item) => item.value === (model.reservation?.service ?? model.service));
  const selectedDate = model.dates.find((item) => item.value === (model.reservation?.date ?? model.date));
  const submit = () => {
    if (!model.confirm() && model.service && model.date && model.time) {
      if (model.name.trim().length < 2) nameRef.current?.focus();
      else emailRef.current?.focus();
    }
  };
  return <Column loose>
    <Column snug>
      <Row snug alignCenter wrap><Badge primary>03 / Booking</Badge><Typography small muted>Studio appointments</Typography></Row>
      <Typography h1>Make space to create.</Typography>
      <Typography lead muted>Choose a service and a time for your next creative session.</Typography>
    </Column>
    <Alert info title="Practice a booking flow" description="This is a local frontend demo. Slots are sample availability in your device's local time. Nothing is charged, sent, or reserved with a business." />
    {model.notice ? <Alert title={model.notice} /> : null}
    {model.reservation ? <Card><Column loose>
      <Alert success title="Sample reservation confirmed" description="Your selection is held in this app's memory until you cancel it or reload." />
      <Typography h2>See you at the studio, {model.reservation.name}.</Typography>
      <DescriptionList divided items={[
        { term: "Service", value: selectedService?.label ?? "" },
        { term: "Date", value: selectedDate?.label ?? "" },
        { term: "Time", value: `${model.reservation.time} (device local time)` },
        { term: "Contact", value: model.reservation.email },
        { term: "Sample price", value: selectedService?.price ?? "" },
      ]} />
      <Button destructive onPress={model.cancelReservation}>Cancel sample reservation</Button>
    </Column></Card> : <Grid columns={2} minTileWidth={340} loose>
      <Card><Column loose>
        <Column tight><Typography h2>Book your session</Typography><Typography muted>All fields are required. You can clear the draft at any time.</Typography></Column>
        <Form accessibilityLabel="Book an appointment" submitLabel="Confirm booking" cancelLabel="Clear draft" onSubmit={submit} onCancel={model.reset} block>
          <Field label="Service" required error={model.errors.service}><Select value={model.service} onSelect={model.changeService} options={services.map(({ value, label }) => ({ value, label }))} placeholder="Choose a service" /></Field>
          <Field label="Appointment date" required error={model.errors.date}><Select value={model.date} onSelect={model.changeDate} options={model.dates} placeholder="Choose a date" /></Field>
          {model.service && model.date ? <Field error={model.errors.time} helper="Changing the service or date clears the selected time.">
            <RadioGroup label="Available times" description="Sample slots, in your device's local time." value={model.time} onChange={(time) => model.setTime(String(time))}>
              {model.slots.map((time) => <Radio key={time} value={time}>{time}</Radio>)}
            </RadioGroup>
          </Field> : <Typography small muted>Choose a service and date to see available times.</Typography>}
          {model.errors.time && (!model.service || !model.date) ? <Alert destructive title={model.errors.time} /> : null}
          <Field label="Booking name" required error={model.errors.name}><Input testID="booking-name" ref={nameRef} value={model.name} onChangeText={model.setName} autoComplete="name" /></Field>
          <Field label="Contact email" required error={model.errors.email}><Input testID="booking-email" ref={emailRef} value={model.email} onChangeText={model.setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" /></Field>
        </Form>
      </Column></Card>
      <Card><Column loose>
        <Typography h2>Your session at a glance</Typography>
        <DescriptionList divided items={[
          { term: "Service", value: selectedService?.label ?? "Choose a service" },
          { term: "Duration", value: selectedService?.duration ?? "—" },
          { term: "Date", value: selectedDate?.label ?? "Choose a date" },
          { term: "Time", value: model.time || "Choose a time" },
          { term: "Sample price", value: selectedService?.price ?? "—" },
        ]} />
        <Typography small muted>No payment details are needed. Reloading clears every sample reservation.</Typography>
      </Column></Card>
    </Grid>}
  </Column>;
}
