import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
  onClickOverride?: () => void;
}

const BackButton = ({
  label = "Retour",
  className = "",
  onClickOverride,
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClickOverride) {
      onClickOverride();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`flex items-center gap-2 hover:none ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};

export default BackButton;
