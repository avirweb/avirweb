#!/bin/bash
# Webflow CDN Image Download Script
# Downloads all broken images from cdn.prod.website-files.com
# Created: $(date)

set -e

BASE_URL="https://cdn.prod.website-files.com"
IMAGES_DIR="site/images"

# Create directory structure
echo "Creating directory structure..."
mkdir -p $IMAGES_DIR/{icons,about,blog,portfolio}

# Service Icons (7)
echo "Downloading service icons..."
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/634f160c4aab386bffbdfdce_Completed_Home%20cinema.svg" -o "$IMAGES_DIR/icons/home-cinema.svg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/63321d325eb1364b8722e824_Completed_Whole%20Home%20AV.svg" -o "$IMAGES_DIR/icons/whole-home-av.svg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/634f160c97b2f503eb935fb2_Completed_Lighting.svg" -o "$IMAGES_DIR/icons/lighting.svg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/634f160cedac82047c722def_Completed_Shades.svg" -o "$IMAGES_DIR/icons/shades.svg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/634f160c5d6872332aea763f_Completed_Hone%20Audio.svg" -o "$IMAGES_DIR/icons/home-audio.svg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/634f160c5365780db863f458_Completed_Security.svg" -o "$IMAGES_DIR/icons/security.svg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/634f160c36574a4d3de12ac3_Completed_Networkibng.svg" -o "$IMAGES_DIR/icons/networking.svg"

# About Page Images (6)
echo "Downloading about page images..."
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/61b7b0010db7550a560ee43e_cc535c_26fd5854a16e409f828ad1623ff786a9_mv2_d_6000_4000_s_4_2.jpg" -o "$IMAGES_DIR/about/team-photo.jpg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/61b7affb5e96f7173a967ec8_cc535c_3c9307a7db4441b39bc89e3b007cc598_mv2_d_6000_3944_s_4_2.jpg" -o "$IMAGES_DIR/about/team-photo-2.jpg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/6203e13010fd3a8200a4b17d_Hag6.jpg" -o "$IMAGES_DIR/about/hag6.jpg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/620588786384dffea3982826_Interior%20Designers.jpg" -o "$IMAGES_DIR/about/interior-designers.jpg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/6205881671b8fc9978ee20b4_Architects.jpg" -o "$IMAGES_DIR/about/architects.jpg"
curl -sL "$BASE_URL/61aeaa63fc373a25c198ab33/6204e32cf2cece6c87efb6de_AdobeStock_450195350%20copy.jpg" -o "$IMAGES_DIR/about/adobe-stock.jpg"

# Portfolio/Brand Images (11)
echo "Downloading portfolio images..."
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/61e1859f36052d5bfb24b820_McIntosh%20Reference%20Music%20System%20horizontal.jpeg" -o "$IMAGES_DIR/portfolio/mcintosh-reference.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/61e93e2ce9c133a98ebad4ab_CrestronTSR310.jpeg" -o "$IMAGES_DIR/portfolio/crestron-tsr310.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/61e93f99c570d2051287056f_Josh%20in%20wall.jpg" -o "$IMAGES_DIR/portfolio/josh-in-wall.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/61e94d21dde32c872fddd9da_meridian%20speakers.jpg" -o "$IMAGES_DIR/portfolio/meridian-speakers.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/61e952624930d9145915af27_in%20wall%20wisdom.jpg" -o "$IMAGES_DIR/portfolio/in-wall-wisdom.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/61e9631009977d48fb5438aa_savantNewFinishes_1440x750_0.png" -o "$IMAGES_DIR/portfolio/savant-finishes.png"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/61e96f0c894a1d55b9c72866_Nautilus_customcolors_1440x1620.jpeg" -o "$IMAGES_DIR/portfolio/nautilus-custom.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/6205806f1829944ff66da091_ketrabar.jpg" -o "$IMAGES_DIR/portfolio/ketrabar.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/6205816c55cb4f0346e958fb_Kalide.jpg" -o "$IMAGES_DIR/portfolio/kalide.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/620d8b5aa280d6f61204e900_sony%20projector%20sand.jpg" -o "$IMAGES_DIR/portfolio/sony-projector-sand.jpg"
curl -sL "$BASE_URL/61d85621390c3d3f845db5b4/622ddd4d0434a8798eb916f3_asset%202.jpeg" -o "$IMAGES_DIR/portfolio/asset-2.jpg"

# Verify downloads
echo ""
echo "Download complete! Verifying files..."
echo "Icons: $(ls -1 $IMAGES_DIR/icons/ | wc -l) files"
echo "About: $(ls -1 $IMAGES_DIR/about/ | wc -l) files"
echo "Portfolio: $(ls -1 $IMAGES_DIR/portfolio/ | wc -l) files"
echo "Blog: $(ls -1 $IMAGES_DIR/blog/ | wc -l) files"
echo ""
echo "Total images: $(find $IMAGES_DIR -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.svg' \) | wc -l)"
