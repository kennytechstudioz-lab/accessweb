'use client';

import { useEffect } from 'react';

export default function SmartSuppWidget() {
  useEffect(() => {
    // Avoid loading twice
    if ((window as any).smartsupp) return;

    var _smartsupp = (window as any)._smartsupp || {};
    _smartsupp.key = 'f649ae17606031bf327b66213ee839f51773c501';
    (window as any)._smartsupp = _smartsupp;

    const o: any = function () { (o as any)._.push(arguments); };
    (o as any)._ = [];
    (window as any).smartsupp = o;

    const s = document.getElementsByTagName('script')[0];
    const c = document.createElement('script');
    c.type = 'text/javascript';
    c.charset = 'utf-8';
    c.async = true;
    c.src = 'https://www.smartsuppchat.com/loader.js?';
    s.parentNode?.insertBefore(c, s);
  }, []);

  return (
    <noscript>
      Powered by{' '}
      <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">
        Smartsupp
      </a>
    </noscript>
  );
}
