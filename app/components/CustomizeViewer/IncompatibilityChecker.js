import { useEffect, useState } from "react";
import { IncompatibilityCheck } from "@/app/utils/IncompatibilityCheck";

export function useIncompatibilityChecker() {
  const [checker, setChecker] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/incompatibility_rules")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.rules)
          setChecker(new IncompatibilityCheck(data.rules));
      })
      .catch(() => {
        if (isMounted) setChecker(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return checker;
}
