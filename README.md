# OpaCash private PWA

A personal, device-local banking-style visual simulator. It does not connect to a bank, process payments, or represent real funds.

## Run locally
1. Install Node.js on a computer or use a browser-based development environment.
2. Run `npm install`
3. Run `npm run dev`
4. Open the shown address in a browser.

## Publish and add to iPhone
Deploy the built site (`npm run build`, output folder `dist`) to an HTTPS static host. Open its URL in Safari on your iPhone, tap Share, then Add to Home Screen.

## Privacy and limitations
- The PIN and account data are stored in this browser's local storage on this device.
- This is not secure server-side authentication. Anyone with access to the unlocked device/browser profile may access the data.
- Clearing website data may erase the PIN and account data.
- There is no cross-device sync or multi-user login.
- All balances and transactions are fictional display data only.
- OpaCash is an original name and is not affiliated with OPay or any bank.
