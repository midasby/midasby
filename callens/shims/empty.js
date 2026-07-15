// Metro shim: @anthropic-ai/sdk'nın Node'a özgü modül içe aktarımları
// (node:fs vb.) mobilde bu boş modüle çözümlenir. SDK'ya apiKey'i açıkça
// verdiğimiz için dosya-tabanlı kimlik bilgisi yolu hiç çalışmaz.
module.exports = {};
