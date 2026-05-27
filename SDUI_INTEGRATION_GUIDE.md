# SDUI Studio — Frontend Integration Guide

> Bu rehber, SDUI Studio'da tasarlanan ve publish edilen UI layoutlarına mobil (Android/iOS/React Native) veya web FE'nin nasıl erişeceğini, nasıl render edeceğini ve nasıl yöneteceğini açıklar.

---

## Table of Contents

1. [Genel Mimari](#1-genel-mimari)
2. [Base URL Konfigürasyonu](#2-base-url-konfigürasyonu)
3. [Temel Endpoint: Layout Çekme](#3-temel-endpoint-layout-çekme)
4. [JSON Yapısı ve Bileşen Kataloğu](#4-json-yapısı-ve-bileşen-kataloğu)
5. [Render Stratejisi](#5-render-stratejisi)
6. [Görsel URL Tipleri](#6-görsel-url-tipleri)
7. [A/B Test](#7-ab-test)
8. [Authentication & Approval Workflow](#8-authentication--approval-workflow)
9. [Platform Bazlı Implementasyonlar](#9-platform-bazlı-implementasyonlar)
10. [Polling & Cache Stratejisi](#10-polling--cache-stratejisi)
11. [Hata Yönetimi & Fallback](#11-hata-yönetimi--fallback)
12. [Tam API Referansı](#12-tam-api-referansı)

---

## 1. Genel Mimari

```
┌─────────────────────────────────────────────────┐
│              SDUI Studio (Backend)               │
│                                                 │
│  ┌──────────┐    publish     ┌───────────────┐  │
│  │ Designer │ ─────────────► │ In-Memory     │  │
│  │  (Web)   │                │ State         │  │
│  └──────────┘                │  mobile layout│  │
│                              │  web layout   │  │
│  ┌──────────┐    approve     │  variant A/B  │  │
│  │  Admin   │ ─────────────► └──────┬────────┘  │
│  └──────────┘                       │           │
└────────────────────────────────────┼────────────┘
                                      │ GET /current-ui
                    ┌─────────────────┼──────────────────┐
                    │                 │                  │
              ┌─────▼─────┐   ┌──────▼──────┐   ┌──────▼──────┐
              │  Android  │   │     iOS     │   │  React Web  │
              │   App     │   │    App      │   │    App      │
              └───────────┘   └─────────────┘   └─────────────┘
```

**Temel çalışma prensibi:**
1. Designer, SDUI Studio'da bir layout tasarlar ve **Publish** eder
2. Layout sunucunun in-memory state'ine kaydedilir
3. FE, `GET /current-ui` ile JSON'u çeker
4. FE, JSON'u kendi SDUI renderer'ı ile native component'lere dönüştürür

> ⚠️ **Önemli:** State şu an in-memory tutulmaktadır. Sunucu yeniden başlatıldığında layout sıfırlanır. Production için bir veritabanı katmanı (`PostgreSQL`, `Redis`) eklenmelidir.

---

## 2. Base URL Konfigürasyonu

Sunucu, `0.0.0.0:8000`'de dinler. Erişim ortamına göre:

| Ortam       | URL                               | Nasıl set edilir                         |
|-------------|-----------------------------------|------------------------------------------|
| Local LAN   | `http://192.168.x.x:8000`         | Otomatik detect (config.py)              |
| Cloud/Render| `https://your-app.onrender.com`   | `RENDER_EXTERNAL_URL` env variable       |
| Docker      | `http://sdui-studio:8000`         | Docker network service name              |

```bash
# .env — cloud deploy için
RENDER_EXTERNAL_URL=https://your-app.onrender.com
GOOGLE_API_KEY=your_gemini_api_key
```

**FE'de base URL tanımı:**

```kotlin
// Android — Kotlin
object SduiConfig {
    const val BASE_URL = "https://your-app.onrender.com"  // or BuildConfig.SDUI_BASE_URL
}
```

```swift
// iOS — Swift
enum SduiConfig {
    static let baseURL = "https://your-app.onrender.com"
}
```

```typescript
// React Native / Web — TypeScript
const SDUI_BASE_URL = process.env.EXPO_PUBLIC_SDUI_URL ?? 'https://your-app.onrender.com';
```

---

## 3. Temel Endpoint: Layout Çekme

### `GET /current-ui`

Aktif yayındaki layout'u döner.

**Query parametreleri:**

| Parametre  | Tip    | Default    | Açıklama                        |
|------------|--------|------------|---------------------------------|
| `platform` | string | `"mobile"` | `"mobile"` veya `"web"`         |

**Request:**
```http
GET /current-ui?platform=mobile
Host: your-app.onrender.com
```

**Response (200 OK):**
```json
{
  "screen_name": "Vodafone 5G Cihazlar",
  "layout": {
    "type": "Column",
    "props": {
      "fillMaxSize": "true",
      "backgroundColor": "#FFFFFF",
      "statusBarPadding": "true"
    },
    "children": [
      {
        "type": "Row",
        "_id": 1,
        "props": {
          "horizontalArrangement": "spacebetween",
          "verticalAlignment": "center",
          "padding": "12,16,12,16"
        },
        "children": [ ... ]
      }
    ]
  }
}
```

**A/B Test aktifken:** Sunucu, her request'te rastgele Variant A veya B döner — FE'nin bunu bilmesine gerek yoktur.

---

## 4. JSON Yapısı ve Bileşen Kataloğu

Her node şu formattadır:

```typescript
interface SduiNode {
  type: string;         // Bileşen tipi (bkz. katalog)
  _id?: number;         // Opsiyonel düğüm ID (seçim için)
  props: Record<string, any>;
  children?: SduiNode[];
}
```

### 4.1 Props Referansı

#### Boyut & Layout
| Prop             | Tip               | Açıklama                                      |
|------------------|-------------------|-----------------------------------------------|
| `fillMaxSize`    | `"true"`          | Width ve height = parent'ı doldur             |
| `fillMaxWidth`   | `"true"`          | Width = %100                                  |
| `fillMaxHeight`  | `"true"`          | Height = %100                                 |
| `width` / `w`    | `number` (dp/px)  | Sabit genişlik                                |
| `height` / `h`   | `number` (dp/px)  | Sabit yükseklik                               |
| `weight`         | `number`          | Flex weight (1 = eşit pay)                    |
| `padding`        | `"top,right,bottom,left"` veya `number` | İç boşluk          |
| `margin`         | `"top,right,bottom,left"` veya `number` | Dış boşluk          |
| `horizontalPadding` / `verticalPadding` | `number` | Kısaltma       |

#### Renkler & Görünüm
| Prop              | Tip      | Açıklama                                   |
|-------------------|----------|--------------------------------------------|
| `backgroundColor` | `string` | Hex (`#RRGGBB`) veya CSS gradient          |
| `color`           | `string` | Yazı rengi                                 |
| `corner` / `cornerRadius` | `number` | Border radius (dp)               |
| `elevation`       | `number` | Gölge derinliği (dp)                       |
| `alpha`           | `0.0-1.0`| Opaklık                                    |
| `backdropFilter`  | `string` | CSS blur efekti (`blur(8px)`)              |
| `borderWidth`     | `number` | Kenarlık kalınlığı                         |
| `borderColor`     | `string` | Kenarlık rengi                             |

#### Tipografi (Text prop'ları)
| Prop           | Değerler                              |
|----------------|---------------------------------------|
| `style`        | `h1` · `h2` · `h3` · `body` · `caption` |
| `fontWeight`   | `bold` · `semibold` · `medium` · `normal` |
| `fontSize`     | `number` (sp/pt)                      |
| `textAlign`    | `left` · `center` · `right`           |
| `textDecoration` | `line-through` · `underline`        |
| `lineHeight`   | `number` veya `"1.5"`                 |

#### Etkileşim
```json
{
  "onClick": { "type": "navigate", "destination": "home" }
}
{
  "onClick": { "type": "toast", "message": "Sepete eklendi!" }
}
```

### 4.2 Bileşen Kataloğu

#### `Column` / `LazyColumn`
Dikey flex container. `LazyColumn` = vertically scrollable list.

```json
{
  "type": "Column",
  "props": {
    "verticalArrangement": "spacedby:12",
    "horizontalAlignment": "center",
    "scroll": "true"
  }
}
```
`verticalArrangement` değerleri: `top` · `bottom` · `center` · `spacebetween` · `spaceevenly` · `spacearound` · `spacedby:N`  
`horizontalAlignment`: `start` · `center` · `end`

#### `Row` / `LazyRow`
Yatay flex container. `LazyRow` = horizontally scrollable.

```json
{
  "type": "Row",
  "props": {
    "horizontalArrangement": "spacebetween",
    "verticalAlignment": "center"
  }
}
```
`horizontalArrangement`: `start` · `end` · `center` · `spacebetween` · `spaceevenly` · `spacearound` · `spacedby:N`  
`verticalAlignment`: `top` · `center` · `bottom`

#### `Box`
Z-axis stack. İlk child zemin, sonraki child'lar overlay olarak konumlanır.

```json
{
  "type": "Box",
  "props": {
    "contentAlignment": "bottomCenter"
  },
  "children": [
    { "type": "Image", "props": { ... } },
    { "type": "Column", "props": { ... } }
  ]
}
```
`contentAlignment`: `topStart` · `topCenter` · `topEnd` · `center` · `bottomStart` · `bottomCenter` · `bottomEnd`

#### `Card`
Kart container (rounded corners + shadow + optional background).

```json
{
  "type": "Card",
  "props": {
    "corner": 16,
    "elevation": 2,
    "backgroundColor": "#FFFFFF",
    "padding": "12,16,12,16",
    "onClick": { "type": "navigate", "destination": "detail" }
  }
}
```

#### `Text`

```json
{
  "type": "Text",
  "props": {
    "text": "Vodafone 5G Kampanyası",
    "style": "h2",
    "fontWeight": "bold",
    "color": "#E60000",
    "textAlign": "center"
  }
}
```

#### `Image`

```json
{
  "type": "Image",
  "props": {
    "url": "https://...",
    "height": 240,
    "fillMaxWidth": "true",
    "contentScale": "crop",
    "contentDescription": "Hero banner",
    "corner": 12
  }
}
```
`contentScale`: `crop` (hero, tam kapla) · `fit` (ürün fotoğrafı, tam göster)

#### `Button`

```json
{
  "type": "Button",
  "props": {
    "text": "Sepete Ekle",
    "backgroundColor": "linear-gradient(135deg,#E60000,#BE0000)",
    "color": "#FFFFFF",
    "corner": 8,
    "padding": "12,24,12,24",
    "fillMaxWidth": "true",
    "onClick": { "type": "toast", "message": "Sepete eklendi!" }
  }
}
```

#### `Icon`
[Material Icons](https://fonts.google.com/icons) snake_case isimleri.

```json
{
  "type": "Icon",
  "props": {
    "name": "shopping_cart",
    "size": 24,
    "color": "#E60000",
    "onClick": { "type": "navigate", "destination": "cart" }
  }
}
```

#### `Spacer`
Boş alan — flex container'da kalan alanı doldurur.

```json
{ "type": "Spacer", "props": { "weight": 1 } }
{ "type": "Spacer", "props": { "height": 16 } }
```

#### `HorizontalDivider` / `Divider`

```json
{
  "type": "HorizontalDivider",
  "props": { "thickness": 1, "color": "#E5E7EB" }
}
```

#### `BottomBar`
Alt navigasyon barı. `items` prop'u array olarak gelir:

```json
{
  "type": "BottomBar",
  "props": {
    "backgroundColor": "#FFFFFF",
    "fillWidth": "true",
    "items": [
      { "icon": "home",    "label": "Ana Sayfa",  "onClick": { "type": "navigate", "destination": "home" } },
      { "icon": "store",   "label": "Ürünler",    "onClick": { "type": "navigate", "destination": "products" }, "active": true },
      { "icon": "receipt", "label": "Faturalar",  "onClick": { "type": "navigate", "destination": "bills" } },
      { "icon": "person",  "label": "Hesabım",    "onClick": { "type": "navigate", "destination": "account" } }
    ]
  }
}
```

#### `BottomSheet`
Modal benzeri aşağıdan çıkan panel:

```json
{
  "type": "BottomSheet",
  "props": {
    "backgroundColor": "#FFFFFF",
    "padding": "20,20,20,20"
  }
}
```

---

## 5. Render Stratejisi

### Genel Yaklaşım (Recursive Renderer)

Her platform için recursive bir render fonksiyonu yazılır:

```
renderNode(node) {
  switch(node.type) {
    case "Column":   return renderColumn(node)
    case "Row":      return renderRow(node)
    case "Card":     return renderCard(node)
    case "Text":     return renderText(node)
    case "Image":    return renderImage(node)
    case "Button":   return renderButton(node)
    case "Icon":     return renderIcon(node)
    case "Box":      return renderBox(node)
    case "Spacer":   return renderSpacer(node)
    case "BottomBar":return renderBottomBar(node)
    default:         return renderColumn(node)  // fallback
  }
}
```

### Props'tan Native Style'a Dönüşüm

#### Padding parsing (`"top,right,bottom,left"` formatı)
```kotlin
fun parsePadding(value: Any?): PaddingValues {
    if (value == null) return PaddingValues(0.dp)
    if (value is Number) return PaddingValues(value.toFloat().dp)
    val parts = value.toString().split(",").map { it.trim().toIntOrNull() ?: 0 }
    return when (parts.size) {
        4 -> PaddingValues(
            top = parts[0].dp, end = parts[1].dp,
            bottom = parts[2].dp, start = parts[3].dp
        )
        else -> PaddingValues(parts.first().dp)
    }
}
```

#### Arrangement parsing
```kotlin
fun parseVerticalArrangement(value: String?): Arrangement.Vertical = when {
    value == null       -> Arrangement.Top
    value == "center"   -> Arrangement.Center
    value == "bottom"   -> Arrangement.Bottom
    value == "spacebetween" -> Arrangement.SpaceBetween
    value == "spaceevenly"  -> Arrangement.SpaceEvenly
    value.startsWith("spacedby:") -> Arrangement.spacedBy(
        value.removePrefix("spacedby:").trim().toInt().dp
    )
    else -> Arrangement.Top
}
```

#### Gradient background
```kotlin
fun parseBackground(value: String?): Brush? {
    if (value == null) return null
    if (value.startsWith("linear-gradient")) {
        // Parse "linear-gradient(135deg, #E60000, #BE0000)"
        val colors = Regex("#[A-Fa-f0-9]{6,8}").findAll(value)
            .map { Color(android.graphics.Color.parseColor(it.value)) }
            .toList()
        return Brush.linearGradient(colors)
    }
    return null
}
```

---

## 6. Görsel URL Tipleri

Backend, layout JSON'undaki görsel URL'lerini otomatik olarak üç tipte üretir:

### 6.1 Gerçek Ürün Fotoğrafı (`search://` → çözümlü URL)
AI'ın ürettiği layout içinde `search://Samsung Galaxy S25 Ultra` gibi URL'ler, backend tarafından publish sırasında **gerçek ürün fotoğrafı URL'sine** dönüştürülür. FE'ye ulaşan JSON'da artık `search://` yoktur.

```json
// FE'ye ulaşan JSON — zaten çözümlenmiş
{ "url": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg" }
```

### 6.2 Static Sunucu Görseli (`/static/...`)
Logo ve ikonlar gibi sunucuda barınan görseller için relative path gelir:

```json
{ "url": "/static/logo.png" }
```

**FE'de mutlaka `BASE_URL` ekleyin:**
```kotlin
val resolvedUrl = if (url.startsWith("/static/") || url.startsWith("/api/")) {
    "$BASE_URL$url"
} else url
```

### 6.3 Pollinations AI Görseli
AI tarafından üretilen görseller için Pollinations URL'si gelir:

```json
{ "url": "https://image.pollinations.ai/prompt/futuristic_5g_network?nologo=true&width=800&height=480&model=flux" }
```

Bu URL'ler dinamik olarak üretilir — standart `AsyncImage` / `Glide` / `Picasso` ile yüklenebilir.

---

## 7. A/B Test

Admin, SDUI Studio'dan iki farklı layout'u A/B test olarak yayınlayabilir. FE'nin bunu yönetmesine gerek yoktur — `/current-ui` çağrısı otomatik olarak A veya B variant'ı döner (sunucu taraflı random seçim).

**A/B Test aktifleştirme (Studio üzerinden):**
```http
POST /publish_ab
Content-Type: application/json

{
  "layout_a": { "screen_name": "...", "layout": { ... } },
  "layout_b": { "screen_name": "...", "layout": { ... } }
}
```

**FE için önerim:** Hangi variant geldiğini loglamak istiyorsanız `screen_name` alanını kullanın — A/B varyantları farklı screen_name'e sahip olabilir.

---

## 8. Authentication & Approval Workflow

### 8.1 Login
```http
POST /api/auth/login
Content-Type: application/json

{ "username": "designer01", "password": "pass123" }
```
```json
{
  "token": "abc123xyz",
  "username": "designer01",
  "role": "user"
}
```

**Tüm authenticated isteklerde:**
```http
Authorization: Bearer abc123xyz
```

### 8.2 Rol Sistemi

| Rol     | Publish davranışı                          |
|---------|--------------------------------------------|
| `admin` | Layout anında yayına girer                 |
| `user`  | Onay kuyruğuna düşer, admin onaylayana kadar yayınlanmaz |
| anonim  | Legacy — direkt publish (development'ta)   |

### 8.3 Approval Flow (Studio → FE)

```
Designer → POST /update_layout  →  status: "pending_approval"
Admin    → POST /api/approvals/{id}/approve  →  layout yayına girer
FE       → GET /current-ui  →  yeni layout
```

---

## 9. Platform Bazlı Implementasyonlar

### 9.1 Android — Jetpack Compose

```kotlin
// SduiViewModel.kt
class SduiViewModel : ViewModel() {
    private val _layout = MutableStateFlow<SduiResponse?>(null)
    val layout = _layout.asStateFlow()

    fun fetchLayout(platform: String = "mobile") {
        viewModelScope.launch {
            try {
                val response = SduiApi.service.getCurrentUi(platform)
                _layout.value = response
            } catch (e: Exception) {
                // fallback to cached layout
            }
        }
    }
}

// SduiApi.kt
interface SduiService {
    @GET("current-ui")
    suspend fun getCurrentUi(@Query("platform") platform: String): SduiResponse
}

data class SduiResponse(
    @SerializedName("screen_name") val screenName: String,
    val layout: SduiNode
)

data class SduiNode(
    val type: String,
    @SerializedName("_id") val id: Int? = null,
    val props: Map<String, JsonElement> = emptyMap(),
    val children: List<SduiNode> = emptyList()
)

// SduiRenderer.kt (Compose)
@Composable
fun SduiNode(node: SduiNode) {
    val p = node.props
    when (node.type) {
        "Column", "LazyColumn" -> SduiColumn(node)
        "Row", "LazyRow"       -> SduiRow(node)
        "Card"                 -> SduiCard(node)
        "Text"                 -> SduiText(node)
        "Image"                -> SduiImage(node)
        "Button"               -> SduiButton(node)
        "Icon"                 -> SduiIcon(node)
        "Box"                  -> SduiBox(node)
        "Spacer"               -> SduiSpacer(node)
        "BottomBar"            -> SduiBottomBar(node)
        "HorizontalDivider",
        "Divider"              -> HorizontalDivider(thickness = p.dp("thickness", 1))
        else                   -> SduiColumn(node)  // safe fallback
    }
}

@Composable
fun SduiImage(node: SduiNode) {
    val p = node.props
    val rawUrl = p.str("url", "")
    val url = if (rawUrl.startsWith("/static/") || rawUrl.startsWith("/api/")) {
        "${SduiConfig.BASE_URL}$rawUrl"
    } else rawUrl

    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(url)
            .crossfade(true)
            .build(),
        contentDescription = p.str("contentDescription"),
        contentScale = if (p.str("contentScale") == "fit") ContentScale.Fit else ContentScale.Crop,
        modifier = Modifier
            .then(if (p.bool("fillMaxWidth")) Modifier.fillMaxWidth() else Modifier)
            .then(p.dp("height").takeIf { it > 0 }?.let { Modifier.height(it.dp) } ?: Modifier)
            .clip(RoundedCornerShape(p.dp("corner", 0).dp))
    )
}
```

### 9.2 iOS — SwiftUI

```swift
// SduiViewModel.swift
@MainActor
class SduiViewModel: ObservableObject {
    @Published var layout: SduiNode?
    @Published var screenName: String = ""

    func fetchLayout(platform: String = "mobile") async {
        guard let url = URL(string: "\(SduiConfig.baseURL)/current-ui?platform=\(platform)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(SduiResponse.self, from: data)
            self.layout = response.layout
            self.screenName = response.screenName
        } catch {
            print("SDUI fetch error: \(error)")
        }
    }
}

struct SduiResponse: Codable {
    let screenName: String
    let layout: SduiNode
    enum CodingKeys: String, CodingKey {
        case screenName = "screen_name"
        case layout
    }
}

// SduiRenderer.swift
struct SduiNodeView: View {
    let node: SduiNode

    var body: some View {
        switch node.type {
        case "Column", "LazyColumn":  SduiColumnView(node: node)
        case "Row", "LazyRow":        SduiRowView(node: node)
        case "Card":                  SduiCardView(node: node)
        case "Text":                  SduiTextView(node: node)
        case "Image":                 SduiImageView(node: node)
        case "Button":                SduiButtonView(node: node)
        case "Icon":                  SduiIconView(node: node)
        case "Box":                   SduiBoxView(node: node)
        case "Spacer":                Spacer()
        default:                      SduiColumnView(node: node)
        }
    }
}

struct SduiImageView: View {
    let node: SduiNode
    var body: some View {
        let rawUrl = node.props["url"] as? String ?? ""
        let resolvedUrl = rawUrl.hasPrefix("/static/") ? "\(SduiConfig.baseURL)\(rawUrl)" : rawUrl
        AsyncImage(url: URL(string: resolvedUrl)) { phase in
            switch phase {
            case .success(let image):
                image.resizable()
                     .aspectRatio(contentMode: node.props["contentScale"] as? String == "fit" ? .fit : .fill)
            case .failure:
                Color.gray.opacity(0.2)
            default:
                ProgressView()
            }
        }
        .frame(
            maxWidth: node.props["fillMaxWidth"] as? String == "true" ? .infinity : nil,
            maxHeight: (node.props["height"] as? Int).map { CGFloat($0) } ?? nil
        )
        .clipped()
        .cornerRadius(CGFloat(node.props["corner"] as? Int ?? 0))
    }
}
```

### 9.3 React Native / Expo

```typescript
// useSdui.ts
import { useEffect, useState } from 'react';

export function useSdui(platform = 'mobile') {
  const [layout, setLayout] = useState<SduiNode | null>(null);
  const [screenName, setScreenName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await fetch(`${SDUI_BASE_URL}/current-ui?platform=${platform}`);
        const data = await res.json();
        setLayout(data.layout);
        setScreenName(data.screen_name);
      } catch (err) {
        console.error('SDUI fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, [platform]);

  return { layout, screenName, loading };
}

// SduiRenderer.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

function SduiNode({ node }: { node: SduiNode }) {
  const p = node.props ?? {};
  switch (node.type) {
    case 'Column':
    case 'LazyColumn':
      return (
        <ScrollView style={columnStyle(p)} contentContainerStyle={{ flexGrow: 1 }}>
          {(node.children ?? []).map((c, i) => <SduiNode key={i} node={c} />)}
        </ScrollView>
      );
    case 'Text':
      return <Text style={textStyle(p)}>{p.text}</Text>;
    case 'Image': {
      const rawUrl: string = p.url ?? '';
      const uri = rawUrl.startsWith('/static/') ? `${SDUI_BASE_URL}${rawUrl}` : rawUrl;
      return <Image source={{ uri }} style={imageStyle(p)} resizeMode={p.contentScale === 'fit' ? 'contain' : 'cover'} />;
    }
    case 'Button':
      return (
        <TouchableOpacity style={buttonStyle(p)} onPress={() => handleAction(p.onClick)}>
          <Text style={{ color: p.color ?? '#fff', fontWeight: '600' }}>{p.text}</Text>
        </TouchableOpacity>
      );
    default:
      return (
        <View style={containerStyle(node.type, p)}>
          {(node.children ?? []).map((c, i) => <SduiNode key={i} node={c} />)}
        </View>
      );
  }
}
```

### 9.4 Web — React/Next.js

Projenin mevcut `sdui-renderer.jsx` dosyası zaten tam bir web renderer içermektedir:

```jsx
// pages/screen.tsx (Next.js)
import { useEffect, useState } from 'react';

export default function SduiScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SDUI_URL}/current-ui?platform=web`)
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <SDUIRenderer
      layout={data.layout}
      selectedIds={[]}
      onSelectId={() => {}}
    />
  );
}
```

---

## 10. Polling & Cache Stratejisi

### Önerilen Yaklaşım: Short-poll + Local Cache

```kotlin
// Android — Kotlin coroutines
class SduiRepository(private val api: SduiService, private val cache: LocalCache) {

    // Fetch layout — cache-first, then refresh
    suspend fun getLayout(platform: String = "mobile"): SduiNode? {
        // 1. Hemen cache'deki layout'u göster
        val cached = cache.getLayout(platform)

        // 2. Arka planda yeni layout'u çek
        try {
            val fresh = api.getCurrentUi(platform)
            cache.saveLayout(platform, fresh)
            return fresh.layout
        } catch (e: Exception) {
            return cached?.layout  // network yoksa cache'i kullan
        }
    }

    // Her 60 saniyede bir güncelle
    fun startPolling(platform: String, onUpdate: (SduiNode) -> Unit) {
        scope.launch {
            while (isActive) {
                delay(60_000L)
                getLayout(platform)?.let { onUpdate(it) }
            }
        }
    }
}
```

### Cache Key Stratejisi
```
cache key = "sdui_layout_{platform}"          → mevcut aktif layout
cache key = "sdui_layout_{platform}_etag"     → HTTP ETag değeri (değişim tespiti)
TTL = 5 dakika (ağ yoksa 24 saat)
```

### Conditional GET (Bandwidth Tasarrufu)
```http
GET /current-ui?platform=mobile
If-None-Match: "abc123"

HTTP/1.1 304 Not Modified   ← layout değişmemişse
HTTP/1.1 200 OK              ← yeni layout var
ETag: "def456"
```

> ⚠️ Not: ETag desteği için backend'e `ETag` header implementasyonu eklenmelidir.

---

## 11. Hata Yönetimi & Fallback

### FE'de 3 katmanlı fallback:

```
1. Disk cache  →  son başarılı layout (uygulama açık kalır)
2. Bundle'daki default JSON  →  hard-coded minimal layout
3. Boş ekran + retry button  →  son çare
```

```kotlin
sealed class SduiState {
    object Loading : SduiState()
    data class Success(val node: SduiNode, val screenName: String) : SduiState()
    data class CachedFallback(val node: SduiNode, val cachedAt: Long) : SduiState()
    data class Error(val msg: String) : SduiState()
}
```

### Bilinmeyen bileşen tipi
Renderer her zaman bilinmeyen tipleri için güvenli bir fallback döndürmelidir:

```kotlin
else -> {
    Log.w("SDUI", "Unknown component type: ${node.type} — rendering as Column fallback")
    SduiColumn(node)  // children'ları yine de render et
}
```

### Geçersiz görsel URL
```kotlin
AsyncImage(
    model = resolvedUrl,
    error = painterResource(R.drawable.img_placeholder),  // fallback görsel
    ...
)
```

---

## 12. Tam API Referansı

| Method | Endpoint                         | Auth Gerekli | Açıklama                                        |
|--------|----------------------------------|--------------|-------------------------------------------------|
| `GET`  | `/current-ui?platform=`          | ❌           | Aktif layout'u çek (A/B dahil)                  |
| `POST` | `/update_layout`                 | ✅ opsiyonel  | Layout publish et (admin=anında, user=onay)     |
| `POST` | `/publish_ab`                    | ❌           | A/B test başlat                                 |
| `POST` | `/generate`                      | ❌           | AI ile yeni layout üret                         |
| `POST` | `/verify`                        | ❌           | Gemini Vision ile layout doğrula/onar           |
| `POST` | `/api/auth/login`                | ❌           | Login → Bearer token al                         |
| `GET`  | `/api/auth/me`                   | ✅           | Oturum bilgisi                                  |
| `POST` | `/api/auth/logout`               | ✅           | Oturumu kapat                                   |
| `GET`  | `/api/approvals/list`            | ✅ admin     | Onay bekleyen layout'lar                        |
| `POST` | `/api/approvals/{id}/approve`    | ✅ admin     | Layout'u onayla → yayına al                     |
| `POST` | `/api/approvals/{id}/reject`     | ✅ admin     | Layout'u reddet                                 |
| `GET`  | `/static/{filename}`             | ❌           | Logo, ikon gibi statik görseller                |

### Response Kodları

| Kod  | Anlam                                                        |
|------|--------------------------------------------------------------|
| 200  | Layout başarıyla döndü                                       |
| 200  | `{ "status": "pending_approval" }` — onay kuyruğuna düştü   |
| 304  | Layout değişmedi (ETag ile conditional GET)                  |
| 401  | Authorization header eksik veya geçersiz token               |
| 403  | Yetki yetersiz (user, admin işlemi yapmaya çalışıyor)        |
| 404  | Layout henüz publish edilmemiş — EmptyState döner            |
| 500  | Sunucu hatası                                                |

---

## Hızlı Başlangıç Checklist

```
□ BASE_URL environment variable'ı set et
□ GET /current-ui'yi uygulama başlangıcında çağır
□ screen_name'i log'a yaz (debug & A/B tracking için)
□ /static/ URL'lerini BASE_URL ile resolve et
□ Bilinmeyen component type için Column fallback ekle
□ Disk cache + bundle fallback JSON hazırla
□ Görsel yükleme hataları için placeholder ekle
□ Polling ya da App-Foreground'a gelince refresh ekle
```

---

*Bu doküman SDUI Studio `v1.x` ile uyumludur. Endpoint veya JSON schema değişikliklerinde güncellenmelidir.*
