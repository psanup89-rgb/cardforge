import CardFormWizard from "@/components/card-form/CardFormWizard";

export default function NewCardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Card</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details and choose a design
        </p>
      </div>
      <CardFormWizard mode="create" />
    </div>
  );
}
