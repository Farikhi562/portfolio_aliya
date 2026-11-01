# Panduan aset: di mana menaruh file dan nama filenya

Semua path relatif terhadap folder utama website (folder yang berisi `index.html`).
Website sudah "menunggu" file-file di bawah. Slot yang filenya belum ada otomatis disembunyikan, jadi tidak ada gambar rusak.

## 1. Foto baru: 5 file

| Taruh di | Nama file | Tampil di |
|---|---|---|
| `img/gallery/` | `baru-1.jpg` | Galeri → "Koleksi baru" |
| `img/gallery/` | `baru-2.jpg` | Galeri → "Koleksi baru" |
| `img/gallery/` | `baru-3.jpg` | Galeri → "Koleksi baru" |
| `img/gallery/` | `baru-4.jpg` | Galeri → "Koleksi baru" |
| `img/gallery/` | `baru-5.jpg` | Galeri → "Koleksi baru" |

**Spesifikasi:** format JPG, sisi terpanjang maksimal 1280 px, target di bawah 150 KB per foto.

Cara konversi (di komputer yang punya ImageMagick):

```bash
magick foto-asli.jpg -resize 960x1280 -quality 78 baru-1.jpg
```

Atau pakai https://squoosh.app (pilih JPG, kualitas 75-80).

## 2. Video baru: 8 file (masing-masing butuh 2 file: video dan poster)

Struktur file **flat** di dalam folder `video/` (semua file langsung di `video/`, tanpa subfolder):

| Taruh di | Video | Poster (gambar sampul) |
|---|---|---|
| `video/` | `baru-1.mp4` | `video/baru-1.jpg` |
| `video/` | `video/baru-2.mp4` | `video/baru-2.jpg` |
| `video/` | `video/baru-3.mp4` | `video/baru-3.jpg` |
| `video/` | `video/baru-4.mp4` | `video/baru-4.jpg` |
| `video/` | `video/baru-5.mp4` | `video/baru-5.jpg` |
| `video/` | `video/baru-6.mp4` | `video/baru-6.jpg` |
| `video/` | `video/baru-7.mp4` | `video/baru-7.jpg` |
| `video/` | `video/baru-8.mp4` | `video/baru-8.jpg` |

Video tampil di bagian Galeri → "Video", setelah 7 video yang sudah ada (`momen-1` sampai `momen-7`).

Status file saat ini:

| File | Status |
|---|---|
| `video/baru-1.mp4` + `video/baru-1.jpg` | **Ada** — tampil |
| `video/baru-2.mp4` + `video/baru-2.jpg` | **Ada** — tampil |
| `video/baru-3.mp4` + `video/baru-3.jpg` | **Ada** — tampil |
| `video/baru-4.mp4` + `video/baru-4.jpg` | **Ada** — tampil |
| `video/baru-5.mp4` + `video/baru-5.jpg` | **Belum ada** — slot disembunyikan |
| `video/baru-6.mp4` + `video/baru-6.jpg` | **Belum ada** — slot disembunyikan |
| `video/baru-7.mp4` + `video/baru-7.jpg` | **Belum ada** — slot disembunyikan |
| `video/baru-8.mp4` + `video/baru-8.jpg` | **Belum ada** — slot disembunyikan |

**Sistem menyembunyikan otomatis:** tombol `<figure>` di `.videos` disembunyikan (via JS) bila
poster (`video/baru-N.jpg`) **atau** file video (`video/baru-N.mp4`) tidak ada. Jadi cukup taruh
kedua-duanya dulu, atau nanti tambahkan — slot baru otomatis muncul saat file sudah tersedia.

**Spesifikasi video:** MP4 (H.264 + AAC), lebar maksimal 540 px, target di bawah 2 MB per video.
**Spesifikasi poster:** JPG, lebar 540 px, target di bawah 70 KB.

Cara konversi dengan ffmpeg:

```bash
# video
ffmpeg -i asli.mp4 -vf "scale='min(540,iw)':-2" -c:v libx264 -preset veryfast -crf 30 \
  -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart baru-1.mp4

# poster (diambil di detik ke-1,5)
ffmpeg -ss 1.5 -i asli.mp4 -frames:v 1 -vf "scale='min(540,iw)':-2" -q:v 5 baru-1.jpg
```

## 3. Setelah file ada: ganti keterangan

Buka `index.html`, cari `baru-1` sampai `baru-8`, lalu ubah:
- Foto: teks `alt="Foto tambahan N"` (untuk SEO dan pembaca layar) dan `<span class="cap">...</span>` (keterangan yang tampil).
- Video: teks di `<figcaption>Video tambahan N</figcaption>`.

Kalau fotonya landscape, ubah juga `width` dan `height` di tag `<img>`-nya sesuai ukuran asli (misalnya 960 dan 540) supaya tata letak tidak bergeser saat dimuat.

## 4. Aset lain yang sudah ada

| Path | Isi |
|---|---|
| `img/profile.jpg` dan `img/profile.jpg` | Foto profil di bagian "Tentang saya" |
| `img/logo-upnvj.png` | **Belum ada.** Taruh logo UPNVJ (PNG latar transparan, tinggi sekitar 96 px) di sini. Muncul otomatis di hero |
| `img/og-image.jpg` | Gambar preview saat link dibagikan (1200x630) |
| `img/favicon.svg` | Ikon tab browser |
| `img/gallery/*.jpg` | 13 foto galeri yang sudah ada |
| `video/momen-1` sampai `momen-7` (`.mp4` + `.jpg`) | 7 video yang sudah ada |

## 5. Ringkasan jumlah

- Foto baru: 5 (`img/gallery/baru-1.jpg` ... `baru-5.jpg`)
- Video baru: 8 (`video/baru-1.mp4` ... `baru-8.mp4`, plus 8 poster `.jpg`)
