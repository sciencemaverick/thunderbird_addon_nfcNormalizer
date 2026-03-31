# Thunderbird Add-ons Submission Notes

## Add-on Name

Korean Attachment NFC Normalizer

## Short Summary

Automatically normalizes macOS Thunderbird attachment filenames to Unicode NFC during compose.

## Full Description

Korean Attachment NFC Normalizer is a macOS-focused Thunderbird add-on that helps reduce Korean filename decomposition issues when sending attachments from Thunderbird.

When a file is attached in a compose window, the add-on checks the attachment name and normalizes it to Unicode NFC if needed. The original file on disk is not renamed or modified. A second check also runs right before sending so missed attachments can still be corrected.

This project is designed to improve cases where Korean filenames created or handled on macOS appear decomposed for recipients or after download.

Key points:

- Does not rename the original file on disk
- Does not change any global macOS filename behavior
- Only adjusts the attachment name inside the Thunderbird compose flow
- Provides an options page for normalization and debug settings
- Can export a JSON diagnostic log file for troubleshooting

## Permissions Rationale

- `compose`: detect and update attachment names in compose windows
- `storage`: persist user settings
- `downloads`: export a diagnostic log file on user request

## Support / Source

- Source code: https://github.com/sciencemaverick/thunderbird_addon_nfcNormalizer
- Support: https://github.com/sciencemaverick/thunderbird_addon_nfcNormalizer/issues
