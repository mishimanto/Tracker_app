import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float time = iTime * 0.5;

    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

type BlurSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const blurClassMap: Record<BlurSize, string> = {
  none: 'backdrop-blur-none',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
  '3xl': 'backdrop-blur-3xl',
};

interface SmokeyBackgroundProps {
  backdropBlurAmount?: BlurSize;
  color?: string;
  className?: string;
}

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: 'user' | 'lock' | 'email';
  endAdornment?: React.ReactNode;
}

interface AuthShellProps {
  title: string;
  subtitle: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const iconMap = {
  user: UserIcon,
  lock: LockClosedIcon,
  email: EnvelopeIcon,
};

const hexToRgb = (hex: string): [number, number, number] => {
  const safeHex = hex.startsWith('#') ? hex.slice(1) : hex;
  const value = safeHex.length === 3
    ? safeHex.split('').map((char) => char + char).join('')
    : safeHex.padEnd(6, '0');

  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
};

export function SmokeyBackground({
  backdropBlurAmount = 'sm',
  color = '#1d4ed8',
  className = '',
}: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const hoveringRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
      return;
    }

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource);

    if (!vertexShader || !fragmentShader) {
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const iTimeLocation = gl.getUniformLocation(program, 'iTime');
    const iMouseLocation = gl.getUniformLocation(program, 'iMouse');
    const uColorLocation = gl.getUniformLocation(program, 'u_color');
    const startTime = performance.now();
    const [r, g, b] = hexToRgb(color);

    if (uColorLocation) {
      gl.uniform3f(uColorLocation, r, g, b);
    }

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);

      if (iResolutionLocation) {
        gl.uniform2f(iResolutionLocation, width, height);
      }

      if (iTimeLocation) {
        gl.uniform1f(iTimeLocation, (performance.now() - startTime) / 1000);
      }

      const pointer = mousePositionRef.current;
      if (iMouseLocation) {
        gl.uniform2f(
          iMouseLocation,
          hoveringRef.current ? pointer.x : width / 2,
          hoveringRef.current ? height - pointer.y : height / 2
        );
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameRef.current = window.requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePositionRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handleMouseEnter = () => {
      hoveringRef.current = true;
    };

    const handleMouseLeave = () => {
      hoveringRef.current = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    render();

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);

      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [color]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className={`absolute inset-0 ${blurClassMap[backdropBlurAmount] ?? blurClassMap.sm}`} />
    </div>
  );
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error,
  icon,
  endAdornment,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  const Icon = icon ? iconMap[icon] : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={inputId}
          type={type}
          placeholder=" "
          className={`peer block w-full border-0 border-b bg-transparent py-3 pl-0 pr-12 text-sm text-white placeholder:text-transparent focus:outline-none focus:ring-0 ${
            error ? 'border-rose-400 focus:border-rose-300' : 'border-white/35 focus:border-sky-300'
          } ${className}`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-0 top-3 origin-left text-sm text-slate-300 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-sky-300 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
        >
          {Icon && <Icon className="mr-2 -mt-0.5 inline h-4 w-4" />}
          {label}
        </label>
        {endAdornment ? (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">{endAdornment}</div>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-200">{error}</p> : null}
    </div>
  );
};

export const PasswordField: React.FC<Omit<FloatingInputProps, 'type' | 'endAdornment' | 'icon'>> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FloatingInput
      {...props}
      icon="lock"
      type={showPassword ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="rounded-full p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      }
    />
  );
};

export const AuthPrimaryButton: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}> = ({ children, loading = false, className = '', type = 'submit' }) => {
  return (
    <button
      type={type}
      disabled={loading}
      className={`group flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 transition-all duration-300 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading ? 'Please wait...' : children}
      {/* <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /> */}
    </button>
  );
};

export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, footer, children }) => {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <SmokeyBackground color="#2563eb" backdropBlurAmount="sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.78))]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-md border border-white/15 bg-white/10 p-8 shadow-2xl shadow-slate-950/45 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            
          </div>

          {children}

          <div className="text-center mt-4 text-sm text-slate-300">{subtitle}</div>
        </div>

      </div>
    </div>
  );
};
