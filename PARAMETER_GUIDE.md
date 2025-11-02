# Visual Parameter Guide

## Understanding Each Parameter

### 1. Spin (a)

**Range**: 0.0 to 0.998  
**Physical Meaning**: Angular momentum per unit mass (J/M)

| Value | Type | Effect |
|-------|------|--------|
| **0.0** | Schwarzschild | • Perfectly spherical<br>• Circular shadow<br>• Symmetric disk<br>• No frame dragging |
| **0.3** | Slow Kerr | • Slight asymmetry<br>• Minor offset<br>• Weak frame drag |
| **0.7** | Moderate Kerr | • Visible offset<br>• Disk brightness variation<br>• Noticeable Doppler shift |
| **0.998** | Near-Extremal | • Maximum offset<br>• Strong asymmetry<br>• Extreme Doppler effect<br>• Photon ring distorted |

**What to Look For**:
- Shadow moves away from center as spin increases
- Right side of disk becomes brighter (blue-shifted)
- Photon ring becomes elliptical
- Einstein ring asymmetry

### 2. Inclination (i)

**Range**: 0° to 180°  
**Physical Meaning**: Angle between spin axis and line of sight

| Value | View | What You See |
|-------|------|--------------|
| **0°** | Face-on (Top) | • Circular rings<br>• Concentric structure<br>• No warping<br>• Full symmetry |
| **30°** | Slight tilt | • Beginning of 3D structure<br>• Minor elliptical distortion<br>• Thin warp hints |
| **70-80°** | **Interstellar View** | • Dramatic warping<br>• Disk above AND below<br>• Maximum visual impact<br>• Strong lensing |
| **90°** | Edge-on | • Thin line across<br>• Maximum Doppler shift<br>• Extreme lensing<br>• Disk "wraps" most |
| **180°** | Bottom view | • Face-on from below<br>• Reversed angular momentum |

**Sweet Spot**: 70-80° for cinematic appearance

### 3. Camera Distance

**Range**: 2.5M to 50M  
**Physical Meaning**: Observer radial coordinate in Schwarzschild radii

| Value | View | Effect |
|-------|------|--------|
| **2.5-5M** | Very Close | • Shadow fills screen<br>• Extreme curvature<br>• Strong lensing<br>• Few orbits visible |
| **10-15M** | Standard | • Balanced view<br>• Clear shadow<br>• Full disk visible<br>• **Recommended** |
| **20-30M** | Distant | • Small shadow<br>• Wide field<br>• More background<br>• Weak lensing |
| **40-50M** | Very Far | • Tiny black hole<br>• Mostly stars<br>• Minimal effect |

**Recommended**: 15M for best balance

### 4. Exposure

**Range**: 0.1 to 5.0  
**Physical Meaning**: HDR tone mapping multiplier

| Value | Brightness | Use Case |
|-------|-----------|----------|
| **0.1-0.5** | Very Dark | • Shadow emphasis<br>• Subtle details<br>• Dark environment |
| **1.0-1.5** | Normal | • **Default setting**<br>• Balanced brightness<br>• Good contrast |
| **2.0-3.0** | Bright | • Highlight disk<br>• Emphasize glow<br>• See faint features |
| **4.0-5.0** | Very Bright | • Overexposed look<br>• Maximum visibility<br>• Artistic effect |

**Recommended**: 1.5 for realistic appearance

### 5. Disk Color Temperature

**Range**: 3000K to 15000K  
**Physical Meaning**: Blackbody temperature at inner disk edge

| Value | Color | Appearance |
|-------|-------|------------|
| **3000K** | Deep Red-Orange | • Cool disk<br>• Like dying star<br>• Red giant color |
| **6000K** | Yellow-White | • Sun-like<br>• Natural appearance<br>• Balanced warmth |
| **9000K** | White-Blue | • Hot disk<br>• High energy<br>• Bright and intense |
| **12000K+** | Blue-White | • Extreme heat<br>• O-type star color<br>• Very luminous |

**Note**: Temperature varies across disk as T(r) ∝ r^(-3/4)

**Recommended**: 6000K for realism, 9000K for dramatic effect

### 6. Show Stars

**Options**: On / Off  
**Physical Meaning**: Render distant starfield background

| Setting | Effect |
|---------|--------|
| **On** | • Full starfield visible<br>• Gravitational lensing visible<br>• Einstein rings<br>• Context for scale |
| **Off** | • Pure black background<br>• Focus on black hole<br>• Better performance (~20% faster)<br>• Cleaner appearance |

**Recommended**: On for full effect, Off for better FPS

### 7. Animate Spin

**Options**: On / Off  
**Physical Meaning**: Gradually vary spin parameter over time

| Setting | Effect |
|---------|--------|
| **On** | • Spin slowly increases<br>• See transition from Schwarzschild to Kerr<br>• Educational demonstration<br>• Dynamic visualization |
| **Off** | • Static spin value<br>• Controlled observation<br>• Fixed for analysis |

**Use Case**: Turn on for demonstrations

## Recommended Presets

### 1. Classic Interstellar
```
Spin:              0.998
Inclination:       70°
Camera Distance:   15M
Exposure:          1.5
Disk Temp:         6000K
Show Stars:        On
```
**Result**: Dramatic warped disk, bright photon ring, asymmetric shadow

### 2. Schwarzschild Study
```
Spin:              0.0
Inclination:       45°
Camera Distance:   12M
Exposure:          1.2
Disk Temp:         8000K
Show Stars:        On
```
**Result**: Perfectly symmetric, ideal for understanding basic GR

### 3. Maximum Kerr
```
Spin:              0.998
Inclination:       85°
Camera Distance:   20M
Exposure:          2.0
Disk Temp:         10000K
Show Stars:        On
```
**Result**: Edge-on view, extreme Doppler shift, maximum lensing

### 4. Face-On Ring
```
Spin:              0.5
Inclination:       0°
Camera Distance:   15M
Exposure:          1.8
Disk Temp:         7000K
Show Stars:        Off
```
**Result**: Beautiful concentric rings, clean geometric structure

### 5. Close-Up Shadow
```
Spin:              0.9
Inclination:       60°
Camera Distance:   5M
Exposure:          1.0
Disk Temp:         12000K
Show Stars:        Off
```
**Result**: Detailed photon ring, strong curvature, intense disk

### 6. Artistic Blue
```
Spin:              0.95
Inclination:       75°
Camera Distance:   18M
Exposure:          2.5
Disk Temp:         14000K
Show Stars:        On
```
**Result**: Blue-white hot disk, bright and dramatic, sci-fi aesthetic

## Performance vs Quality

### Maximum Quality (RTX 3060+ / RX 6700 XT+)
```
Resolution:     1920×1080 or 2560×1440
MAX_STEPS:      1000 (edit shader)
STEP_SIZE:      0.02 (edit shader)
Show Stars:     On
Expected FPS:   45-60
```

### Balanced (GTX 1660 / RX 5600)
```
Resolution:     1280×720 or 1920×1080
MAX_STEPS:      500 (default)
STEP_SIZE:      0.05 (default)
Show Stars:     On
Expected FPS:   40-60
```

### Performance (Integrated Graphics)
```
Resolution:     1024×576 or 1280×720
MAX_STEPS:      250 (edit shader)
STEP_SIZE:      0.1 (edit shader)
Show Stars:     Off
Expected FPS:   30-45
```

## Physical Phenomena to Observe

### 1. Gravitational Redshift
- **Where**: Disk color gradient (red toward outer edge)
- **Physics**: g = √(1 - 2/r), light loses energy climbing out of gravity well
- **Best View**: Face-on (i=0°), moderate exposure

### 2. Doppler Shift
- **Where**: Disk brightness asymmetry (left/right)
- **Physics**: Moving gas blue-shifts (toward) or red-shifts (away)
- **Best View**: i=70-80°, high spin (a=0.998)

### 3. Frame Dragging
- **Where**: Shadow offset from center
- **Physics**: Spinning mass drags spacetime around it
- **Best View**: High spin, moderate inclination

### 4. Photon Sphere
- **Where**: Bright ring around shadow
- **Physics**: Photons orbit multiple times before escaping
- **Best View**: Close distance (5-10M), moderate exposure

### 5. Einstein Ring
- **Where**: Distorted, duplicated background stars
- **Physics**: Light bends around massive object
- **Best View**: Stars On, medium distance (15M)

### 6. Accretion Disk Warping
- **Where**: Disk visible both above AND below black hole
- **Physics**: Light paths curve around hole to reach observer
- **Best View**: i=70-80°, any spin

## Troubleshooting Appearance

### "I only see a black screen"
- Increase **Exposure** to 2.0
- Turn **Show Stars** On
- Move **Camera Distance** to 15M
- Verify spin is between 0 and 0.998

### "Disk looks flat/boring"
- Increase **Inclination** to 70-80°
- Increase **Spin** to 0.9-0.998
- Adjust **Camera Distance** to 12-18M

### "Can't see the shadow"
- Decrease **Exposure** to 1.0-1.5
- Move **Camera Distance** closer (8-12M)
- Turn **Show Stars** Off for contrast

### "Colors look wrong"
- Adjust **Disk Temperature** (6000-9000K is realistic)
- Verify gamma correction is working
- Check HDR tone mapping

### "Lensing looks weak"
- Increase **Spin** to 0.998
- Set **Inclination** to 70-80°
- Move **Camera Distance** to 15-20M
- Turn **Show Stars** On to see distortion

## Experimental Parameters

Try these for interesting effects:

1. **Ultra-Close Flyby**: Distance = 2.5M, i=85°, a=0.998
2. **Reverse View**: Inclination = 150°, see disk from below
3. **Hot Blue Disk**: Temp = 15000K, Exposure = 3.0
4. **Cool Red Disk**: Temp = 3000K, Exposure = 1.0
5. **Maximum Asymmetry**: a=0.998, i=90°, Distance=20M

## Quick Reference Chart

| Want to See... | Adjust This... | To Value... |
|----------------|----------------|-------------|
| Symmetry | Spin | 0.0 |
| Asymmetry | Spin | 0.998 |
| Circular view | Inclination | 0° or 180° |
| Warped disk | Inclination | 70-80° |
| Close-up | Camera Distance | 5-8M |
| Wide view | Camera Distance | 25-40M |
| Brighter | Exposure | 2.0-3.0 |
| Darker/Moody | Exposure | 0.5-1.0 |
| Cool disk | Temperature | 3000-5000K |
| Hot disk | Temperature | 10000-15000K |
| Star lensing | Show Stars | On |
| Clean look | Show Stars | Off |

Experiment and discover the incredible variety of black hole appearances! 🌌
