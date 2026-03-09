import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

interface Props {
  recipientName: string;
  cardHolderName: string;
  presentUrl: string;
  publicUrl: string;
}

export default function CardPublishedEmail({
  recipientName,
  cardHolderName,
  presentUrl,
  publicUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your digital business card is live — open it at your next event</Preview>
      <Body style={{ background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "40px auto", background: "#fff", borderRadius: 12, padding: "32px 40px" }}>
          <Heading style={{ fontSize: 24, color: "#111827", marginBottom: 8 }}>
            Your card is live! 🎉
          </Heading>
          <Text style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
            Hi {recipientName}, <strong>{cardHolderName}</strong>&apos;s digital business card
            has been published. Here&apos;s how to use it:
          </Text>

          {/* Step 1 */}
          <Section style={{ background: "#f9fafb", borderRadius: 8, padding: "16px 20px", marginBottom: 12 }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              At events
            </Text>
            <Text style={{ margin: "6px 0 12px", fontSize: 14, color: "#111827", lineHeight: 1.5 }}>
              Open your <strong>Present Mode</strong> and show the QR code on your phone.
              Clients scan it to instantly save your contact.
            </Text>
            <Button
              href={presentUrl}
              style={{
                background: "#111827",
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Open Present Mode →
            </Button>
          </Section>

          {/* Step 2 */}
          <Section style={{ background: "#f9fafb", borderRadius: 8, padding: "16px 20px", marginBottom: 24 }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Share online
            </Text>
            <Text style={{ margin: "6px 0 12px", fontSize: 14, color: "#111827", lineHeight: 1.5 }}>
              Send this link over email, WhatsApp, or any message. Recipients can save your
              contact with one tap.
            </Text>
            <Button
              href={publicUrl}
              style={{
                background: "#6366f1",
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Client Card Link →
            </Button>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb" }} />

          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 16 }}>
            Client link:{" "}
            <a href={publicUrl} style={{ color: "#6366f1" }}>{publicUrl}</a>
          </Text>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
            Present mode:{" "}
            <a href={presentUrl} style={{ color: "#374151" }}>{presentUrl}</a>
          </Text>
          <Text style={{ fontSize: 12, color: "#d1d5db" }}>
            Created with CardForge — Digital Business Cards
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
