/** Landing URL for guests; signed-in users are redirected off `/` by middleware. */
export function marketingHomePath(isSignedIn: boolean | undefined): "/" | "/home" {
  return isSignedIn ? "/home" : "/";
}
