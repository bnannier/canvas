import { AlertDialog } from "@nannier/canvas";

export const DeleteIdentity = () => (
  <AlertDialog
    embedded
    open
    destructive
    title="Delete this identity?"
    description="This permanently removes the identity and revokes any active sessions. This action cannot be undone."
    confirmLabel="Delete"
    cancelLabel="Cancel"
  />
);

export const TypeToConfirm = () => (
  <AlertDialog
    embedded
    open
    destructive
    withInput
    confirmText="northwind"
    title="Delete the Northwind workspace?"
    description="Type the workspace name to confirm. All projects and members are removed."
    confirmLabel="Delete workspace"
  />
);
