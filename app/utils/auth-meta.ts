export function createAuthMeta(title: string, description: string) {
  return [
    { title: `${title} - Boi na Nuvem` },
    {
      name: "description",
      content: description,
    },
  ];
}
