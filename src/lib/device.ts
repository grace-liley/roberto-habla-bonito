// Phones and tablets get their own version of the chat (ChatInterfaceMobile)
// while the iPhone mic problem is being fixed. Laptops and desktops keep the
// version that already works for them (ChatInterface).
export const isPhoneOrTablet = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // Every iPhone and iPad browser (Safari, Brave, Chrome...) runs on Apple's
  // engine and has the same mic behaviour. iPads often say they're a Mac, so
  // a "Mac" with a touchscreen counts too (real Macs have no touchscreen).
  const apple = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  const android = /Android/i.test(ua)
  return apple || android
}
