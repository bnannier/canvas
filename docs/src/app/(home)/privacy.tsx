import { Linking } from "react-native";
import { Column } from "@nannier/canvas";
import { Page } from "../../ui/page";
import { PageNav } from "../../ui/page-nav";
import { DocsHead } from "../../ui/docs-head";
import { PrivacyContent } from "../../ui/privacy-content";
import { PRIVACY_ISSUES_URL, PRIVACY_TITLE } from "../../data/privacy-policy";

// The app and tools/privacygen render the same Canvas policy composition.
export default function PrivacyScreen() {
  return <Page><Column loose>
    <DocsHead title={PRIVACY_TITLE} />
    <PrivacyContent onContact={() => Linking.openURL(PRIVACY_ISSUES_URL)} />
    <PageNav />
  </Column></Page>;
}
