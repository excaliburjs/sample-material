import { Actor, Color, DisplayMode, Engine, ImageSource, Loader } from "excalibur";
import { glsl } from "../glsl";
import greynoise from "./blue.png?url";

const nebulaFrag = glsl`#version 300 es
precision highp float;
uniform sampler2D u_noise;
uniform float u_time_ms;
float u_time = 0.;
uniform vec2 u_resolution;
in vec2 v_uv;
out vec4 fragColor;

float palette( in float a, in float b, in float c, in float d, in float x ) {
    return a + b * cos(6.28318 * (c * x + d));
}

// 2D Noise from IQ
float Noise2D( in vec2 x )
{
    ivec2 p = ivec2(floor(x));
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    ivec2 uv = p.xy;

    float rgA = texelFetch( u_noise, (uv+ivec2(0,0))&255, 0 ).x;
    float rgB = texelFetch( u_noise, (uv+ivec2(1,0))&255, 0 ).x;
    float rgC = texelFetch( u_noise, (uv+ivec2(0,1))&255, 0 ).x;
    float rgD = texelFetch( u_noise, (uv+ivec2(1,1))&255, 0 ).x;
    return mix( mix( rgA, rgB, f.x ),
                mix( rgC, rgD, f.x ), f.y );
}

float ComputeFBM( in vec2 pos )
{
    float amplitude = 0.75;
    float sum = 0.0;
    float maxAmp = 0.0;
    for(int i = 0; i < 6; ++i)
    {
        sum += Noise2D(pos) * amplitude;
        maxAmp += amplitude;
        amplitude *= 0.5;
        pos *= 2.2;
    }
    return sum / maxAmp;
}

// Same function but with a different, constant amount of octaves
float ComputeFBMStars( in vec2 pos )
{
    float amplitude = 0.75;
    float sum = 0.0;
    float maxAmp = 0.0;
    for(int i = 0; i < 5; ++i)
    {
        sum += Noise2D(pos) * amplitude;
        maxAmp += amplitude;
        amplitude *= 0.5;
        pos *= 2.0;
    }
    return sum / maxAmp * 1.15;
}

vec3 BackgroundColor( in vec2 uv ) {
    
    // Sample various noises and multiply them
    float noise1 = ComputeFBMStars(uv * 5.0);
    float noise2 = ComputeFBMStars(uv * vec2(15.125, 25.7));
    float noise3 = ComputeFBMStars((uv + vec2(0.5, 0.1)) * 4.0 + u_time * 0.35);
    float starShape = noise1 * noise2 * noise3;
    
    // Compute star falloff - not really doing what i hoped it would, i wanted smooth falloff around each star
    float falloffRadius = 0.2;
    float baseThreshold = 0.6; // higher = less stars
    
    starShape = clamp(starShape - baseThreshold + falloffRadius, 0.0, 1.0);
    //starShape = 0.002;
    float weight = starShape / (2.0 * falloffRadius);
    return weight * vec3(noise1 * 0.55, noise2 * 0.4, noise3 * 1.0) * 6.0; // artificial scale just makes the stars brighter
}


void main(  )
{
    u_time = u_time_ms / 1000.;
    vec2 uv = v_uv;
    vec2 scrPt = uv * 2.0 - 1.0;
    vec4 finalColor;
    
   
	// Define density for some shape representing the milky way galaxy
    
    float milkywayShape;
    
    // Distort input screen pos slightly so the galaxy isnt perfectly axis aligned
    float galaxyOffset = (cos(scrPt.x * 5.0) * sin(scrPt.x * 2.0) * 0.5 + 0.5) * 0.0;
    
    // Apply a slight rotation to the screen point, similar to the galaxy
    float theta = length(scrPt) * 0.25; // Visualy tweaked until it looked natural
    mat2 rot;
    
    // cache calls to sin/cos(theta)
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);
    
    rot[0][0] = cosTheta;
    rot[0][1] = -sinTheta;
    rot[1][0] = sinTheta;
    rot[1][1] = cosTheta;
    
    vec2 rotatedScrPt = scrPt * rot;
    
    float noiseVal = ComputeFBM(rotatedScrPt * 5.0 + 50.0 + u_time * 0.015625 * 1.5);
    
    rotatedScrPt += vec2(noiseVal) * 0.3;
    
    float centralFalloff = clamp(1.0 - length(scrPt.y + galaxyOffset), 0.0, 1.0);
    float xDirFalloff = (cos(scrPt.x * 2.0) * 0.5 + 0.5);
    
    float centralFalloff_rot = 1.0 - length(rotatedScrPt.y + galaxyOffset);
    float xDirFalloff_rot = (cos(rotatedScrPt.x * 2.0) * 0.5 + 0.5);
    
    // Falloff in y dir and x-dir fade
    float lowFreqNoiseForFalloff = ComputeFBM(rotatedScrPt * 4.0 - u_time * 0.015625 * 1.5); // 1/64
    //float lowFreqNoiseForFalloff_offset = ComputeFBM(rotatedScrPt * 1.5 + 0.005 * lowFreqNoiseForFalloff);
    milkywayShape = clamp(pow(centralFalloff_rot, 3.0) - lowFreqNoiseForFalloff * 0.5, 0.0, 1.0) * xDirFalloff_rot;
    
    // Lighting
    vec3 color;
    
    // desired brown color
    //vec3 brown = vec3(0.35, 0.175, 0.15) * 17.0;
    //vec3 mainColor = vec3(0.925, 1.0, 0.8) * 10.0;
    //color = mix(brown, mainColor, pow(milkywayShape, 1.0)) * 2.0 * milkywayShape;
    
    // Cosine-based pallette: http://dev.thi.ng/gradients/
    // there is also a famous IQ article on this and a less famous shader on my profile
    color.r = palette(0.5, -1.081592653589793, 0.798407346410207, 0.0, pow(milkywayShape, 1.0));
    color.g = palette(0.5, 0.658407346410207, 0.908407346410207, 0.268407346410207, pow(milkywayShape, 1.0));
    color.b = palette(0.5, -0.201592653589793, 0.318407346410207, -0.001592653589793, pow(milkywayShape, 1.0));
    
    /* dont do this
    color.r += 0.5 * palette(0.5, -0.481592653589793, 0.798407346410207, 0.0, pow(noiseVal, 1.0));
    color.g += 0.5 * palette(0.5, 0.428407346410207, 0.908407346410207, 0.268407346410207, pow(noiseVal, 0.5));
    color.b += 0.5 * palette(0.5, -0.001592653589793, 0.318407346410207, -0.001592653589793, pow(noiseVal, 1.0));
    */
    
    // Experimented with removing color, worked out decently
    float removeColor = (pow(milkywayShape, 10.0) + lowFreqNoiseForFalloff * 0.1) * 5.0;
    color -= vec3(removeColor);
    
    // Add some blue to the background
    vec3 backgroundCol = BackgroundColor(uv.xy * 0.125) * pow(centralFalloff, 0.5) * pow(xDirFalloff, 0.5);
    vec3 blueish = vec3(0.2, 0.2, 0.4);
    backgroundCol += blueish * (5.0 - milkywayShape) * pow(centralFalloff_rot, 2.0) * lowFreqNoiseForFalloff * pow(xDirFalloff, 0.75);
    
    vec3 whiteish = vec3(0.5, 1.0, 0.85);
    backgroundCol += whiteish * 0.95 * pow(centralFalloff, 1.5) * lowFreqNoiseForFalloff * pow(xDirFalloff, 2.0);
    
    
    finalColor = vec4(mix(backgroundCol, color, milkywayShape), 1);
    
    fragColor = finalColor;
}`;


const game = new Engine({
    width: 800,
    height: 800,
    displayMode: DisplayMode.FitScreen,
    suppressPlayButton: true,
    backgroundColor: Color.Black
});
const imgNoise1 = new ImageSource(greynoise);

const loader = new Loader([
    imgNoise1
]);

const nebula = new Actor({
    pos: game.screen.center,
    width: 800,
    height: 800,
    color: Color.Transparent,
    z: 1
});
nebula.graphics.material = game.graphicsContext.createMaterial({
    fragmentSource: nebulaFrag,
    images: {
        u_noise: imgNoise1,
    }
});

game.add(nebula);
game.start(loader);

