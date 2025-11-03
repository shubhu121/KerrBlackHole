#version 460 core

in vec2 vTexCoord;
out vec4 FragColor;

// Uniforms
uniform vec2 uResolution;
uniform float uSpin;
uniform float uInclination;
uniform float uCameraDist;
uniform float uExposure;
uniform bool uShowStars;
uniform float uTime;
uniform float uDiskColorTemp;

// Constants
const float PI = 3.14159265359;
const float MAX_STEPS = 100.0; // Reduced from 150
const float STEP_SIZE = 0.08; // Increased from 0.04 for fewer steps
const float EVENT_HORIZON_MARGIN = 0.01;
const float DISK_INNER_MULT = 1.5;
const float DISK_OUTER = 25.0;
const float DISK_THICKNESS = 0.15;

// ============================================================================
// OPTIMIZED NOISE FUNCTIONS
// ============================================================================

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash3D(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

// Simplified noise with fewer operations
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Reduced octave count from 5 to 3 for performance
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Simplified 3D noise
float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + 113.0 * i.z;
    return mix(mix(mix(hash(vec2(n, 0.0)), hash(vec2(n + 1.0, 0.0)), f.x),
                   mix(hash(vec2(n + 57.0, 0.0)), hash(vec2(n + 58.0, 0.0)), f.x), f.y),
               mix(mix(hash(vec2(n + 113.0, 0.0)), hash(vec2(n + 114.0, 0.0)), f.x),
                   mix(hash(vec2(n + 170.0, 0.0)), hash(vec2(n + 171.0, 0.0)), f.x), f.y), f.z);
}

// ============================================================================
// KERR METRIC FUNCTIONS
// ============================================================================

float sigma(float r, float theta, float a) {
    float cosTheta = cos(theta);
    float cosTheta2 = cosTheta * cosTheta;
    return r * r + a * a * cosTheta2;
}

float delta(float r, float a) {
    float r2 = r * r;
    return r2 - 2.0 * r + a * a;
}

float A_metric(float r, float theta, float a) {
    float sinTheta = sin(theta);
    float sin2 = sinTheta * sinTheta;
    float r2 = r * r;
    float a2 = a * a;
    float r2_plus_a2 = r2 + a2;
    return r2_plus_a2 * r2_plus_a2 - a2 * delta(r, a) * sin2;
}

float eventHorizonRadius(float a) {
    float a2 = a * a;
    return 1.0 + sqrt(max(0.0, 1.0 - a2));
}

// ============================================================================
// OPTIMIZED BLACKBODY COLOR
// ============================================================================

vec3 blackbodyColor(float T) {
    T = clamp(T, 1000.0, 40000.0);
    float t = T * 0.001; // Precompute division
    vec3 color = vec3(0.0);
    
    // Simplified blackbody approximation with fewer branches
    float t_minus_60 = t - 60.0;
    float t_minus_10 = t - 10.0;
    
    // Red channel
    color.r = (t <= 66.0) ? 1.0 : clamp(329.698727446 * pow(t_minus_60, -0.1332047592) * 0.00392156862745, 0.0, 1.0);
    
    // Green channel
    color.g = (t <= 66.0) ? 
        clamp((99.4708025861 * log(t) - 161.1195681661) * 0.00392156862745, 0.0, 1.0) :
        clamp(288.1221695283 * pow(t_minus_60, -0.0755148492) * 0.00392156862745, 0.0, 1.0);
    
    // Blue channel
    if (t >= 66.0) {
        color.b = 1.0;
    } else if (t <= 19.0) {
        color.b = 0.0;
    } else {
        color.b = clamp((138.5177312231 * log(t_minus_10) - 305.0447927307) * 0.00392156862745, 0.0, 1.0);
    }
    
    return color;
}

// ============================================================================
// OPTIMIZED STARFIELD
// ============================================================================

vec3 starfield(vec3 dir) {
    vec3 stars = vec3(0.0);
    
    float phi = atan(dir.z, dir.x);
    float theta = acos(clamp(dir.y, -1.0, 1.0));
    vec2 uv = vec2(phi * 0.1591549430919, theta * 0.3183098861838) * 150.0; // Precompute 1/(2PI) and 1/PI
    
    // Reduced star layers from 4 to 2 for performance
    for (int i = 0; i < 2; i++) {
        vec2 id = floor(uv * (2.0 * float(i) + 1.0));
        float h = hash(id + float(i) * 100.0);
        
        if (h > 0.992) {
            vec2 localUV = fract(uv * (2.0 * float(i) + 1.0));
            float dist2 = dot(localUV - vec2(0.5), localUV - vec2(0.5)); // Use squared distance
            float brightness = pow(h, 4.0) * exp(-dist2 * 120.0);
            
            float starTemp = mix(3000.0, 15000.0, h);
            vec3 starColor = blackbodyColor(starTemp);
            
            float trail = exp(-dist2 * 30.0) * 0.3;
            stars += starColor * (brightness * 8.0 + trail);
        }
    }
    
    // Simplified nebula/galaxy background
    vec2 nebUV = vec2(phi * 2.0, theta * 3.0);
    float nebula = fbm(nebUV * 3.0 + uTime * 0.01) * 0.08;
    vec3 nebColor = vec3(0.2, 0.3, 0.6) * nebula;
    
    // Simplified milky way
    float sinPhi2 = sin(phi * 2.0);
    sinPhi2 = sinPhi2 * sinPhi2; // Square for pow equivalent
    float cosTheta3 = cos(theta * 3.0);
    cosTheta3 = cosTheta3 * cosTheta3 * cosTheta3; // Cube
    float milkyWay = sqrt(sinPhi2) * abs(cosTheta3) * 0.15; // Simplified pow
    milkyWay *= fbm(vec2(phi * 10.0, theta * 5.0));
    vec3 milkyColor = vec3(0.4, 0.5, 0.7) * milkyWay;
    
    return stars + nebColor + milkyColor;
}

// ============================================================================
// RK4 GEODESIC INTEGRATION
// ============================================================================

struct PhotonState {
    float r, theta, phi;
    float pr, ptheta, pphi;
};

PhotonState computeDerivatives(PhotonState state, float a) {
    PhotonState deriv;
    
    float r = state.r;
    float theta = state.theta;
    float pr = state.pr;
    float ptheta = state.ptheta;
    float pphi = state.pphi;
    
    float sig = sigma(r, theta, a);
    float del = delta(r, a);
    
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);
    float sin2 = sinTheta * sinTheta;
    float inv_sig = 1.0 / sig;
    float inv_del = (del != 0.0) ? 1.0 / del : 0.0;
    
    deriv.r = del * pr * inv_sig;
    deriv.theta = ptheta * inv_sig;
    
    float r2_plus_a2 = r * r + a * a;
    float term = a * (r2_plus_a2 - a * pphi * (1.0 / sin2)) * inv_del;
    deriv.phi = pphi * inv_sig * (1.0 / sin2) - term * inv_sig;
    
    // Optimized derivative calculations
    float dr_sig = 2.0 * r;
    float dr_del = 2.0 * (r - 1.0);
    float dtheta_sig = -2.0 * a * a * cosTheta * sinTheta;
    
    float pr2 = pr * pr;
    float ptheta2 = ptheta * ptheta;
    float pphi2_sin2 = pphi * pphi * (1.0 / sin2);
    
    deriv.pr = (pr2 * dr_del * inv_del - ptheta2 * dr_sig * inv_sig * inv_sig 
                + pphi2_sin2 * dr_sig * inv_sig * inv_sig * inv_sig) * inv_sig;
    
    deriv.ptheta = (ptheta2 * dtheta_sig * inv_sig * inv_sig 
                    + sinTheta * cosTheta * pphi2_sin2 * pphi2_sin2) * inv_sig;
    
    deriv.pphi = 0.0;
    
    return deriv;
}

PhotonState rk4Step(PhotonState state, float h, float a) {
    PhotonState k1 = computeDerivatives(state, a);
    
    PhotonState temp;
    float h_half = h * 0.5;
    temp.r = state.r + h_half * k1.r;
    temp.theta = state.theta + h_half * k1.theta;
    temp.phi = state.phi + h_half * k1.phi;
    temp.pr = state.pr + h_half * k1.pr;
    temp.ptheta = state.ptheta + h_half * k1.ptheta;
    temp.pphi = state.pphi;
    PhotonState k2 = computeDerivatives(temp, a);
    
    temp.r = state.r + h_half * k2.r;
    temp.theta = state.theta + h_half * k2.theta;
    temp.phi = state.phi + h_half * k2.phi;
    temp.pr = state.pr + h_half * k2.pr;
    temp.ptheta = state.ptheta + h_half * k2.ptheta;
    temp.pphi = state.pphi;
    PhotonState k3 = computeDerivatives(temp, a);
    
    temp.r = state.r + h * k3.r;
    temp.theta = state.theta + h * k3.theta;
    temp.phi = state.phi + h * k3.phi;
    temp.pr = state.pr + h * k3.pr;
    temp.ptheta = state.ptheta + h * k3.ptheta;
    temp.pphi = state.pphi;
    PhotonState k4 = computeDerivatives(temp, a);
    
    float inv_6 = 1.0 / 6.0;
    PhotonState result;
    result.r = state.r + h * (k1.r + 2.0 * (k2.r + k3.r) + k4.r) * inv_6;
    result.theta = state.theta + h * (k1.theta + 2.0 * (k2.theta + k3.theta) + k4.theta) * inv_6;
    result.phi = state.phi + h * (k1.phi + 2.0 * (k2.phi + k3.phi) + k4.phi) * inv_6;
    result.pr = state.pr + h * (k1.pr + 2.0 * (k2.pr + k3.pr) + k4.pr) * inv_6;
    result.ptheta = state.ptheta + h * (k1.ptheta + 2.0 * (k2.ptheta + k3.ptheta) + k4.ptheta) * inv_6;
    result.pphi = state.pphi;
    
    return result;
}

// ============================================================================
// OPTIMIZED DISK RENDERING
// ============================================================================

vec3 renderDisk(float r, float phi, float theta, float a, float rHorizon, vec3 camPos) {
    float rDiskInner = rHorizon * DISK_INNER_MULT;
    
    if (r < rDiskInner || r > DISK_OUTER) return vec3(0.0);
    
    // Optimized orbital velocity
    float r_sqrt = sqrt(r);
    float omega = 1.0 / (r * r_sqrt);
    float vPhi = r * omega;
    
    // Base temperature profile
    float T = uDiskColorTemp * pow(rDiskInner / r, 0.75);
    
    // Gravitational and Doppler shifts
    float redshift_factor = max(0.01, 1.0 - 2.0 / r);
    float redshift = sqrt(redshift_factor);
    float dopplerShift = 1.0 / max(0.1, 1.0 + vPhi * sin(phi));
    T *= redshift * dopplerShift;
    
    // Simplified disk structure
    vec2 diskUV = vec2(r * 0.5, phi * 5.0);
    float turbulence = fbm(diskUV + uTime * 0.05);
    float spiral = sin(phi * 3.0 - r * 2.0 + uTime * 0.2) * 0.5 + 0.5;
    
    // Combined disk pattern
    float diskPattern = smoothstep(0.3, 0.7, turbulence) * 0.5 + spiral * 0.3 + noise(diskUV * 5.0) * 0.2;
    
    // Optimized brightness calculation
    float r_ratio = rDiskInner / r;
    float brightness = pow(r_ratio, 3.5) * (0.7 + diskPattern * 0.3);
    brightness *= smoothstep(DISK_OUTER, DISK_OUTER - 3.0, r);
    brightness *= smoothstep(rDiskInner, rDiskInner + 0.5, r);
    
    // Photon sphere enhancement
    float photonSphere = 1.5 * (1.0 + cos((2.0 / 3.0) * acos(-a)));
    float r_minus_photon = r - photonSphere;
    float ringGlow = exp(-r_minus_photon * r_minus_photon * 11.1111111111) * 3.0; // Precomputed 1/0.3^2
    
    // Color with temperature variation
    vec3 diskColor = blackbodyColor(T * (1.0 + turbulence * 0.2));
    
    // Inner glow
    float r_minus_inner = r - rDiskInner;
    float innerGlow = exp(-r_minus_inner * r_minus_inner * 4.0) * 2.0; // Precomputed 1/0.5^2
    diskColor += vec3(1.5, 1.2, 1.0) * innerGlow;
    
    return diskColor * brightness * (1.0 + ringGlow);
}

// ============================================================================
// OPTIMIZED VOLUMETRIC GLOW
// ============================================================================

vec3 volumetricGlow(PhotonState photon, float a, float rHorizon) {
    vec3 glow = vec3(0.0);
    float r = photon.r;
    
    // Photon sphere glow
    float photonSphere = 1.5 * (1.0 + cos((2.0 / 3.0) * acos(-a)));
    float distToPhotonSphere = abs(r - photonSphere);
    if (distToPhotonSphere < 1.0) {
        float intensity = exp(-distToPhotonSphere * 2.0) * 0.15;
        glow += vec3(1.2, 0.9, 0.7) * intensity;
    }
    
    // Inner glow near horizon
    float distToHorizon = r - rHorizon;
    if (distToHorizon < 1.5) {
        float intensity = exp(-distToHorizon * 1.5) * 0.1;
        glow += vec3(0.8, 1.0, 1.2) * intensity;
    }
    
    return glow;
}

// ============================================================================
// MAIN RAY TRACING
// ============================================================================

vec3 traceRay(vec3 rayOrigin, vec3 rayDir, float a) {
    float r0 = length(rayOrigin);
    float theta0 = acos(rayOrigin.y / r0);
    float phi0 = atan(rayOrigin.z, rayOrigin.x);
    
    PhotonState photon;
    photon.r = r0;
    photon.theta = theta0;
    photon.phi = phi0;
    photon.pr = -dot(rayDir, normalize(rayOrigin));
    photon.ptheta = rayDir.y * 0.5;
    photon.pphi = length(cross(rayOrigin, rayDir)) * 0.5;
    
    float rHorizon = eventHorizonRadius(a);
    float rDiskInner = rHorizon * DISK_INNER_MULT;
    
    vec3 accumulatedColor = vec3(0.0);
    vec3 accumulatedGlow = vec3(0.0);
    bool hitDisk = false;
    
    for (float step = 0.0; step < MAX_STEPS; step += 1.0) {
        if (photon.r < rHorizon + EVENT_HORIZON_MARGIN) {
            return accumulatedColor + accumulatedGlow;
        }
        
        if (photon.r > 100.0) {
            vec3 background = vec3(0.0);
            if (uShowStars) {
                float sinTheta = sin(photon.theta);
                vec3 dir = vec3(
                    sinTheta * cos(photon.phi),
                    cos(photon.theta),
                    sinTheta * sin(photon.phi)
                );
                background = starfield(dir);
            }
            float accumLength = length(accumulatedColor);
            return accumulatedColor + accumulatedGlow + background * (1.0 - min(1.0, accumLength));
        }
        
        // Accumulate volumetric glow
        accumulatedGlow += volumetricGlow(photon, a, rHorizon) * STEP_SIZE;
        
        // Check disk intersection
        float diskPlaneZ = photon.r * cos(photon.theta);
        float diskR = photon.r * sin(photon.theta);
        
        if (abs(diskPlaneZ) < DISK_THICKNESS && diskR > rDiskInner && diskR < DISK_OUTER && !hitDisk) {
            vec3 diskColor = renderDisk(diskR, photon.phi, photon.theta, a, rHorizon, rayOrigin);
            
            // Simplified dust effect
            float dustNoise = noise3D(vec3(diskR * 0.5, photon.phi * 3.0, uTime * 0.1));
            float dustWisps = pow(dustNoise, 3.0) * 0.4;
            diskColor += diskColor * dustWisps;
            
            accumulatedColor += diskColor;
            hitDisk = true;
        }
        
        photon = rk4Step(photon, -STEP_SIZE, a);
        photon.theta = clamp(photon.theta, 0.01, PI - 0.01);
    }
    
    return accumulatedColor + accumulatedGlow;
}

// ============================================================================
// OPTIMIZED TONE MAPPING
// ============================================================================

vec3 enhancedACES(vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 bloom(vec3 color, float threshold) {
    vec3 bright = max(color - threshold, 0.0);
    return bright * 0.3;
}

// ============================================================================
// MAIN
// ============================================================================

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    
    float inclination = uInclination;
    float cameraDist = uCameraDist;
    
    vec3 camPos = vec3(
        cameraDist * sin(inclination),
        cameraDist * cos(inclination),
        0.0
    );
    
    vec3 forward = normalize(-camPos);
    vec3 right = normalize(cross(vec3(0, 1, 0), forward));
    vec3 up = cross(forward, right);
    
    float fov = 1.0;
    vec3 rayDir = normalize(forward + uv.x * right * fov + uv.y * up * fov);
    
    // Trace ray
    vec3 color = traceRay(camPos, rayDir, uSpin);
    
    // Add bloom
    color += bloom(color, 0.8);
    
    // HDR exposure and tone mapping
    color *= uExposure;
    color = enhancedACES(color);
    
    // Vignette
    float uv_dot = dot(uv, uv);
    color *= 1.0 - uv_dot * 0.3;
    
    // Gamma correction
    color = pow(color, vec3(0.4545454545)); // Precompute 1/2.2
    
    FragColor = vec4(color, 1.0);
}
