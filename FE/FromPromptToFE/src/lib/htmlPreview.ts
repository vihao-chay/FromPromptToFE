export const htmlForPreview = (raw: string, isThumbnail: boolean = false): string => {
  // Script nhúng Tailwind CSS qua CDN
  const tailwindScript = `<script src="https://cdn.tailwindcss.com"></script>`;

  const overflow = isThumbnail ? 'overflow: hidden !important;' : 'overflow: auto !important;';

  const script = `
<script>
  if (window.location.search.includes('thumbnail=true')) {
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('overflow', 'hidden', 'important');
  }
</script>`;

  const style = `
<style>
  ::-webkit-scrollbar { display: none !important; }
  html, body { ${overflow} margin: 0; padding: 0; -webkit-font-smoothing: antialiased; background-color: transparent; }
  * { box-sizing: border-box; }
</style>`;

  // Nếu chuỗi HTML do AI sinh ra đã có thẻ <head>
  if (/<head[\s>]/i.test(raw)) {
    let injected = raw;
    // Kiểm tra xem AI đã tự chèn tailwind chưa, nếu chưa thì mình chèn thêm vào
    if (!injected.includes('tailwindcss.com')) {
      injected = injected.replace(/<head([^>]*)>/i, `<head$1>\n${tailwindScript}\n${style}\n${script}`);
    } else {
      injected = injected.replace(/<head([^>]*)>/i, `<head$1>\n${style}\n${script}`);
    }
    return injected;
  }

  // Nếu AI chỉ trả về mỗi thẻ <div> trần, mình bọc lại thành 1 trang HTML hoàn chỉnh
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    ${tailwindScript}
    ${style}
    ${script}
  </head>
  <body>
    ${raw}
  </body>
</html>`;
};
