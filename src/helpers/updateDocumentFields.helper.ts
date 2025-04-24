export default function updateDocumentFields<T extends object>(
  document: T,
  updates: Partial<T>,
  allowedFields?: (keyof T)[]
) {
  Object.entries(updates).forEach(([key, value]) => {
    const typedKey = key as keyof T;

    if (
      value !== undefined &&
      (!allowedFields || allowedFields.includes(typedKey))
    ) {
      (document[typedKey] as any) = value;
    }
  });

  return document;
}
