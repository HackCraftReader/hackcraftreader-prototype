
// Given a URL, extract a useful displayable domain section
export default function extractDomain(url) {
  if (!url) {
    return '';
  }
  var domain;
    // find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }

    // find & remove port number
  domain = domain.split(':')[0];

  if (domain.startsWith('www.')) {
    domain = domain.slice(4);
  }
  return domain;
}
