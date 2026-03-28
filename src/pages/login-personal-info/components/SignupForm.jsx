import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import Input from "../../../components/ui/Input";
import { useIntroVibeAuth } from "../../../introVibeAuth";
import { getPostAuthRoute, INTEREST_OPTIONS, uniqueInterests } from "../../../utils/introVibe";

const avatarOptions = [
  { id: 1, icon: "User", label: "Default", color: "var(--color-primary)" },
  { id: 2, icon: "Smile", label: "Friendly", color: "var(--color-accent)" },
  { id: 3, icon: "Heart", label: "Warm", color: "var(--color-error)" },
  { id: 4, icon: "Star", label: "Bright", color: "var(--color-warning)" },
  { id: 5, icon: "Zap", label: "Bold", color: "var(--color-success)" },
  { id: 6, icon: "Moon", label: "Calm", color: "var(--color-muted-foreground)" },
];

const SignupForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { signUp, error: authError } = useIntroVibeAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedAvatar: 1,
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customInterest, setCustomInterest] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sortedInterests = useMemo(() => [...INTEREST_OPTIONS].sort(), []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors?.[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((entry) => entry !== interest)
        : [...prev, interest]
    );

    if (errors?.interests) {
      setErrors((prev) => ({
        ...prev,
        interests: "",
      }));
    }
  };

  const addCustomInterest = () => {
    const trimmedInterest = customInterest.trim();
    if (!trimmedInterest) return;

    setSelectedInterests((prev) => uniqueInterests([...prev, trimmedInterest]));
    setCustomInterest("");
    setErrors((prev) => ({
      ...prev,
      interests: "",
    }));
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z\d]/.test(password)) strength += 1;

    const strengthMap = {
      0: { label: "Too weak", color: "var(--color-error)" },
      1: { label: "Weak", color: "var(--color-error)" },
      2: { label: "Fair", color: "var(--color-warning)" },
      3: { label: "Good", color: "var(--color-success)" },
      4: { label: "Strong", color: "var(--color-success)" },
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.username.trim()) {
      nextErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      nextErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (selectedInterests.length === 0) {
      nextErrors.interests = "Choose at least one interest to build your IntroVibe profile.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await signUp({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      interests: selectedInterests,
      avatarId: formData.selectedAvatar,
    });

    if (result?.success) {
      navigate(getPostAuthRoute(result.user));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      general: result?.error || authError || "Unable to create account.",
    }));
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors?.general && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3">
          <Icon name="AlertCircle" size={20} color="var(--color-error)" />
          <p className="text-sm text-error flex-1">{errors.general}</p>
        </div>
      )}

      <Input
        label="Username"
        type="text"
        name="username"
        placeholder="Choose a username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
        disabled={isLoading}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        disabled={isLoading}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 p-2 rounded-lg hover:bg-muted transition-gentle"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <Icon
            name={showPassword ? "EyeOff" : "Eye"}
            size={18}
            color="var(--color-muted-foreground)"
          />
        </button>
      </div>

      {formData.password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Password strength</span>
            <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
              {passwordStrength.label}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(passwordStrength.strength / 4) * 100}%`,
                backgroundColor: passwordStrength.color,
              }}
            />
          </div>
        </div>
      )}

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-3 top-9 p-2 rounded-lg hover:bg-muted transition-gentle"
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
        >
          <Icon
            name={showConfirmPassword ? "EyeOff" : "Eye"}
            size={18}
            color="var(--color-muted-foreground)"
          />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Select your interests <span className="text-destructive ml-1">*</span>
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            IntroVibe uses these quietly in the background to predict your likely personality before the 5-question test.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedInterests.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={[
                  "px-3 py-2 rounded-full border text-sm transition-gentle",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50",
                ].join(" ")}
              >
                {interest}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customInterest}
            onChange={(event) => setCustomInterest(event.target.value)}
            placeholder="Add another interest"
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground caret-primary placeholder:text-muted-foreground"
          />
          <Button type="button" variant="outline" onClick={addCustomInterest}>
            Add interest
          </Button>
        </div>

        {selectedInterests.length > 0 && (
          <div className="rounded-2xl bg-muted/40 border border-border p-4">
            <p className="text-sm font-medium text-foreground mb-2">Selected</p>
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full bg-card border border-border text-sm text-foreground"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {errors?.interests && (
          <p className="text-sm text-destructive">{errors.interests}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium leading-none text-foreground">
          Choose your avatar <span className="text-destructive ml-1">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {avatarOptions.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, selectedAvatar: avatar.id }))}
              disabled={isLoading}
              className={[
                "relative p-4 rounded-2xl border-2 transition-gentle",
                formData.selectedAvatar === avatar.id
                  ? "border-primary bg-primary/5 shadow-gentle"
                  : "border-border bg-card hover:border-primary/40",
              ].join(" ")}
              aria-label={`Select ${avatar.label} avatar`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon
                  name={avatar.icon}
                  size={26}
                  color={
                    formData.selectedAvatar === avatar.id
                      ? avatar.color
                      : "var(--color-muted-foreground)"
                  }
                />
                <span className="text-xs font-medium">{avatar.label}</span>
              </div>
              {formData.selectedAvatar === avatar.id && (
                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                  <Icon name="Check" size={12} color="white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        iconName="UserPlus"
        iconPosition="right"
      >
        Create IntroVibe account
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="text-sm text-primary hover:text-primary/80 transition-gentle caption"
        >
          Already have an account? Log in
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
