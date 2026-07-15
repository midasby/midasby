const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @anthropic-ai/sdk, Node ortamları için node:fs / node:path içe aktarır.
// React Native'de bu modüller yok; SDK'dan gelen bu istekleri boş modüle
// yönlendiriyoruz (apiKey'i açıkça verdiğimizden dosya tabanlı kimlik
// bilgisi keşfi zaten kullanılmıyor).
const emptyShim = path.resolve(__dirname, 'shims/empty.js');
const NODE_BUILTINS = new Set(['fs', 'path', 'os', 'crypto', 'child_process', 'util', 'stream']);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const bare = moduleName.startsWith('node:') ? moduleName.slice(5) : moduleName;
  const fromAnthropicSdk = context.originModulePath.includes(`${path.sep}@anthropic-ai${path.sep}`);
  if (fromAnthropicSdk && NODE_BUILTINS.has(bare)) {
    return { type: 'sourceFile', filePath: emptyShim };
  }
  if (defaultResolveRequest) return defaultResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
