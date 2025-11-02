# Physics Implementation Details

## Kerr Metric in Boyer-Lindquist Coordinates

The Kerr metric describes the spacetime geometry around a rotating black hole with mass M and angular momentum J = aM (in geometric units where G = c = 1).

### Line Element

```
ds² = -(1 - 2r/Σ)dt² - 4ar sin²θ/Σ dt dφ + Σ/Δ dr² + Σ dθ² + (r² + a² + 2a²r sin²θ/Σ) sin²θ dφ²
```

Where:
- **Σ(r,θ) = r² + a²cos²θ**
- **Δ(r) = r² - 2r + a²**
- **A(r,θ) = (r² + a²)² - a²Δsin²θ**

### Event Horizon

The event horizon occurs where Δ(r) = 0:

```
r₊ = M + √(M² - a²) = 1 + √(1 - a²)  [in units M=1]
```

For maximum rotation (a → M), r₊ → M (the horizon approaches the singularity).

## Photon Geodesics

### Hamiltonian Formulation

For null geodesics (photons), we use the Hamiltonian:

```
H = (1/2)g^μν p_μ p_ν = 0
```

where p_μ are the generalized momenta.

### Constants of Motion

Due to the symmetries of the Kerr metric:

1. **Energy**: E (time translation invariance)
2. **Angular momentum**: L_z (axial symmetry)
3. **Carter constant**: Q (hidden symmetry)

These conserved quantities determine the photon trajectory.

### Geodesic Equations

In Boyer-Lindquist coordinates:

```
Σ dr/dλ = ±√R(r)
Σ dθ/dλ = ±√Θ(θ)
Σ dφ/dλ = -[(a² - L_z²/sin²θ)] + aP(r)/Δ
Σ dt/dλ = -a(aE sin²θ - L_z) + (r² + a²)P(r)/Δ
```

Where:
```
R(r) = P(r)² - Δ[r² + (L_z - aE)² + Q]
Θ(θ) = Q - cos²θ[a²E² + L_z²/sin²θ]
P(r) = E(r² + a²) - aL_z
```

## Numerical Integration: RK4 Method

Our implementation uses a 4th-order Runge-Kutta integrator:

```
k₁ = f(y_n)
k₂ = f(y_n + h/2 · k₁)
k₃ = f(y_n + h/2 · k₂)
k₄ = f(y_n + h · k₃)

y_{n+1} = y_n + h/6(k₁ + 2k₂ + 2k₃ + k₄)
```

This provides O(h⁵) local truncation error and O(h⁴) global error.

## Accretion Disk Physics

### Orbital Velocity

For circular orbits in the Kerr metric (equatorial plane):

```
Ω(r) = 1/(a + r^(3/2))  [prograde]
v_φ = r·Ω(r)
```

### Temperature Profile

Assuming a thin, geometrically thin disk with Shakura-Sunyaev model:

```
T(r) = T_in · (r_in/r)^(3/4)
```

This comes from the energy dissipation rate ∝ r⁻³.

### Gravitational Redshift

The redshift factor for emission from radius r:

```
g_gravity = √(1 - 2M/r) = √(1 - 2/r)  [M=1]
```

### Doppler Shift

For orbital motion with velocity v:

```
g_doppler = 1/(1 - v·cos(α))
```

where α is the angle between velocity and line-of-sight.

### Combined Shift

```
ν_observed = ν_emitted · g_gravity · g_doppler

T_observed = T_emitted · g_gravity · g_doppler
```

The approaching side (moving toward observer) is **blue-shifted** (higher T → bluer/whiter).
The receding side (moving away) is **red-shifted** (lower T → redder/dimmer).

## Photon Sphere and Shadow

### Photon Sphere Radius

For Schwarzschild (a=0):
```
r_ph = 3M = 3  [M=1]
```

For Kerr, it depends on inclination:
```
r_ph(θ) ≈ 2M{1 + cos[(2/3)arccos(∓a)]}
```
(± for prograde/retrograde orbits)

### Shadow Size

The observed shadow size (from infinity) depends on:
- Spin parameter a
- Inclination angle i
- Impact parameters (α, β)

For a=0: circular shadow with radius ≈ 2.6M
For a→1: offset, distorted ellipse

## Blackbody Radiation

### Planck's Law

Spectral radiance:
```
B_λ(λ,T) = (2hc²/λ⁵) · 1/(e^(hc/λkT) - 1)
```

### Color Approximation

We use empirical fits to convert temperature to RGB:

```glsl
vec3 blackbodyColor(float T) {
    // Polynomial approximations for R, G, B channels
    // Based on curve fitting to Planck spectrum
}
```

Typical temperatures:
- 3000 K: Orange-red (cool stars)
- 6000 K: White-yellow (Sun)
- 12000 K: Blue-white (hot stars)

## Frame Dragging (Lense-Thirring Effect)

The Kerr metric induces frame dragging:

```
ω(r,θ) = 2Mar/(Σ·A)  [angular velocity of space itself]
```

This causes:
1. Orbits to preferentially align with spin
2. Asymmetric photon trajectories
3. Offset shadow from the black hole center

## Limiting Cases

### Schwarzschild Limit (a → 0)

When spin vanishes:
- Metric reduces to Schwarzschild
- r₊ = 2M (in conventional units)
- Spherical symmetry restored
- Shadow perfectly circular

### Extremal Kerr (a → M)

Maximum possible spin:
- r₊ → M (horizon approaches singularity)
- Inner stable circular orbit (ISCO) → M
- Maximum frame dragging
- Most pronounced lensing effects

## Computational Optimizations

### Step Size Selection

Adaptive step size based on curvature:
```
h = h₀ · min(1, r/r_min)
```

Smaller steps near horizon, larger at infinity.

### Early Termination

Exit integration when:
1. r < r₊ + ε (absorbed by horizon)
2. r > r_max (escaped to infinity)
3. steps > MAX_STEPS (prevent infinite loops)

### Precision Trade-offs

- Double precision: More accurate but slower
- Float precision: Faster but artifacts near horizon
- Half precision: Not recommended (unstable)

## References

1. **Kerr, R. P. (1963)**. "Gravitational Field of a Spinning Mass as an Example of Algebraically Special Metrics". *Physical Review Letters* 11 (5): 237–238.

2. **Bardeen, J. M., Press, W. H., & Teukolsky, S. A. (1972)**. "Rotating Black Holes: Locally Nonrotating Frames, Energy Extraction, and Scalar Synchrotron Radiation". *The Astrophysical Journal* 178: 347.

3. **Shakura, N. I. & Sunyaev, R. A. (1973)**. "Black Holes in Binary Systems. Observational Appearance". *Astronomy & Astrophysics* 24: 337–355.

4. **Cunningham, C. T. & Bardeen, J. M. (1973)**. "The Optical Appearance of a Star Orbiting an Extreme Kerr Black Hole". *The Astrophysical Journal* 183: 237–264.

5. **Luminet, J.-P. (1979)**. "Image of a spherical black hole with thin accretion disk". *Astronomy & Astrophysics* 75: 228–235.

6. **James, O., von Tunzelmann, E., Franklin, P., & Thorne, K. S. (2015)**. "Gravitational Lensing by Spinning Black Holes in Astrophysics, and in the Movie Interstellar". *Classical and Quantum Gravity* 32 (6): 065001.
