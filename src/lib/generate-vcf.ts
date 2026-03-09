import type { BusinessCard } from "@/components/card-designs/types";

export function generateVCF(card: BusinessCard): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  // N: is required by iOS to parse the contact — format: Last;First;Middle;Prefix;Suffix
  const nameParts = card.full_name.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName = nameParts[nameParts.length - 1];
  lines.push(`N:${lastName};${firstName};;;`);
  lines.push(`FN:${card.full_name}`);

  if (card.company_name) lines.push(`ORG:${card.company_name}`);
  if (card.designation) lines.push(`TITLE:${card.designation}`);

  if (card.email) lines.push(`EMAIL;TYPE=INTERNET;TYPE=WORK:${card.email}`);
  if (card.phone) lines.push(`TEL;TYPE=WORK;TYPE=VOICE:${card.phone}`);
  if (card.website) lines.push(`URL;TYPE=WORK:${card.website}`);

  if (card.location) {
    lines.push(`ADR;TYPE=WORK:;;${card.location};;;;`);
  }

  const socialLinks = card.social_links as Record<string, string> | undefined;
  if (socialLinks?.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${socialLinks.linkedin}`);
  if (socialLinks?.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${socialLinks.twitter}`);
  if (socialLinks?.github) lines.push(`X-SOCIALPROFILE;TYPE=github:${socialLinks.github}`);
  if (socialLinks?.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${socialLinks.instagram}`);

  lines.push(`NOTE:Digital business card`);
  lines.push("END:VCARD");

  return lines.join("\r\n") + "\r\n";
}

export function downloadVCF(card: BusinessCard): void {
  const vcf = generateVCF(card);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${card.full_name.replace(/\s+/g, "_")}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
