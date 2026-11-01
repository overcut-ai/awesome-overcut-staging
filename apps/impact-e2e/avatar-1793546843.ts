export function avatarUrl(user: { avatar: { url: string } | null }): string | undefined {
  return user.avatar?.url;
}
