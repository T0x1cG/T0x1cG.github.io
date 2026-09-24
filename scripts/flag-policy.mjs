// Text-only publication check; not a secret scanner for binaries or git history.
export function hasPublishedFlag(text) {
  return /\b(?:flag|ctf|htb|ddctf)\{/i.test(String(text));
}
