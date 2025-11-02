# Quick Start Guide

## For Windows Users

### Prerequisites

1. **Windows 10/11** (64-bit)
2. **Visual Studio 2019 or later** with C++ Desktop Development workload
3. **CMake 3.15+** - [Download](https://cmake.org/download/)
4. **Git** - [Download](https://git-scm.com/download/win)

### Option A: Automated Setup (Recommended)

1. **Install vcpkg** (Microsoft's C++ package manager):
   ```cmd
   git clone https://github.com/Microsoft/vcpkg.git
   cd vcpkg
   bootstrap-vcpkg.bat
   vcpkg integrate install
   ```
   
   Note the vcpkg root path (e.g., `C:\vcpkg`)

2. **Set environment variable**:
   ```cmd
   setx VCPKG_ROOT "C:\vcpkg"
   ```
   (Replace with your actual vcpkg path)

3. **Clone this repository**:
   ```cmd
   git clone https://github.com/yourusername/kerr_blackhole.git
   cd kerr_blackhole
   ```

4. **Run setup script**:
   ```cmd
   setup.bat
   ```

5. **Setup GLAD** (one-time manual step):
   - Visit [https://glad.dav1d.de/](https://glad.dav1d.de/)
   - Language: **C/C++**
   - Specification: **OpenGL**
   - API gl: **Version 4.6**
   - Profile: **Core**
   - Click **GENERATE**
   - Download `glad.zip`
   - Extract to `external/glad/` so you have:
     ```
     external/glad/
       ├── include/
       │   ├── glad/
       │   │   └── glad.h
       │   └── KHR/
       │       └── khrplatform.h
       └── src/
           └── glad.c
     ```

6. **Build**:
   Open "Developer Command Prompt for VS 2019/2022":
   ```cmd
   build.bat
   ```

7. **Run**:
   ```cmd
   cd build\Release
   KerrBlackHole.exe
   ```

### Option B: Manual Setup

1. **Install dependencies manually**:
   ```cmd
   vcpkg install glfw3:x64-windows glad:x64-windows
   ```

2. **Clone ImGui**:
   ```cmd
   cd external
   git clone https://github.com/ocornut/imgui.git
   cd ..
   ```

3. **Setup GLAD** (see step 5 above)

4. **Build with CMake**:
   ```cmd
   mkdir build
   cd build
   cmake .. -DCMAKE_TOOLCHAIN_FILE=%VCPKG_ROOT%\scripts\buildsystems\vcpkg.cmake -A x64
   cmake --build . --config Release
   ```

5. **Run**:
   ```cmd
   Release\KerrBlackHole.exe
   ```

## First Run

When you launch the application, you'll see:

### Main Window
- A black hole shadow in the center
- A glowing accretion disk (orange/white)
- Background stars (if enabled)

### Control Panel (ImGui)
Default parameters:
- **Spin (a)**: 0.998 (near-maximum Kerr)
- **Inclination**: 70° (classic Interstellar view)
- **Camera Distance**: 15M
- **Exposure**: 1.5

### Try These First

1. **Schwarzschild Black Hole** (Non-rotating):
   - Click "Reset to Schwarzschild (a=0)"
   - Notice the perfectly circular shadow

2. **Maximum Spin**:
   - Click "Maximize Spin (a=0.998)"
   - See the offset, asymmetric shadow
   - Observe the brighter disk on one side (Doppler boost)

3. **Change Viewing Angle**:
   - Drag with left mouse to rotate inclination
   - At i=0° (top view): disk appears as concentric rings
   - At i=90° (edge-on): disk warps above and below

4. **Zoom**:
   - Scroll wheel to zoom in/out
   - Get close to see the photon ring detail
   - Pull back to see the full lensing effect

## Troubleshooting

### "Failed to initialize GLFW"
- Ensure you have OpenGL 4.6 capable GPU
- Update graphics drivers

### "Shader compilation error"
- Check `shaders/` folder exists in the same directory as `.exe`
- Verify shader files are present and not corrupted

### Black screen
- Increase exposure in ImGui panel
- Toggle "Show Stars" on
- Check that spin value is between 0 and 0.998

### Low FPS
- Reduce resolution
- In `blackhole.frag`, reduce `MAX_STEPS` (line 24)
- Increase `STEP_SIZE` (line 25)
- Disable stars (uncheck "Show Stars")

### CMake can't find dependencies
- Verify vcpkg integration: `vcpkg integrate install`
- Set VCPKG_ROOT environment variable
- Use: `cmake .. -DCMAKE_TOOLCHAIN_FILE=path\to\vcpkg\scripts\buildsystems\vcpkg.cmake`

### Missing glad.h or imgui files
- Double-check directory structure:
  ```
  kerr_blackhole/
    ├── main.cpp
    ├── CMakeLists.txt
    ├── shaders/
    │   ├── blackhole.vert
    │   └── blackhole.frag
    └── external/
        ├── glad/
        │   ├── include/glad/glad.h
        │   └── src/glad.c
        └── imgui/
            ├── imgui.cpp
            ├── imgui.h
            └── backends/
                ├── imgui_impl_glfw.cpp
                ├── imgui_impl_glfw.h
                ├── imgui_impl_opengl3.cpp
                └── imgui_impl_opengl3.h
  ```

## Performance Tips

### For High-End GPUs (RTX 3060+, RX 6700 XT+)
- Increase resolution to 1920×1080 or higher
- Increase `MAX_STEPS` to 1000 for smoother lensing
- Decrease `STEP_SIZE` to 0.02 for accuracy

### For Mid-Range GPUs (GTX 1660, RX 5600)
- Keep default settings (1280×720)
- `MAX_STEPS` = 500
- `STEP_SIZE` = 0.05

### For Integrated Graphics
- Lower resolution to 1024×576
- `MAX_STEPS` = 250
- `STEP_SIZE` = 0.1
- Disable stars

## What You're Seeing

### Black Shadow
The **event horizon** - nothing escapes from here, not even light. Any ray that crosses r₊ is absorbed and rendered black.

### Bright Ring Around Shadow
The **photon sphere** - photons orbit multiple times before escaping. Creates a bright ring at r ≈ 1.5M.

### Warped Disk
The **accretion disk** - hot gas spiraling into the black hole. Warped appearance is due to gravitational lensing bending light paths around the black hole.

### Color Variation on Disk
- **Brighter side**: Gas moving toward you (blue-shifted, Doppler effect)
- **Dimmer side**: Gas moving away (red-shifted)
- **Color gradient**: Temperature decreases with radius (T ∝ r⁻³/⁴)

### Background Distortion
**Gravitational lensing** - starlight bends around the massive black hole, creating distorted, duplicated, and magnified star images (Einstein rings).

## Next Steps

1. Read `PHYSICS.md` for detailed explanation of the mathematics
2. Read `README.md` for complete feature list
3. Experiment with parameters to understand the physics
4. Modify shaders to add your own effects

## Getting Help

- Check `README.md` for detailed documentation
- Review `PHYSICS.md` for scientific background
- Open an issue on GitHub for bugs or questions

Enjoy exploring the warped spacetime around a spinning black hole! 🌌
