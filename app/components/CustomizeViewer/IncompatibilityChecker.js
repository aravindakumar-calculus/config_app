import { useEffect, useState } from "react";
import { IncompatibilityCheck } from "@/app/utils/IncompatibilityCheck";
import { useStore } from "@/store/useStore";

export function useIncompatibilityChecker() {
  const rules = useStore((s) => s.incompatibilityRules);
  const setRules = useStore((s) => s.setIncompatibilityRules);
  const [checker, setChecker] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!rules) {
      fetch("/api/incompatibility_rules")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.rules) {
            setRules(data.rules);
            setChecker(new IncompatibilityCheck(data.rules));
          }
        })
        .catch(() => {
          if (isMounted) setChecker(null);
        });
    } else {
      setChecker(new IncompatibilityCheck(rules));
    }
    return () => {
      isMounted = false;
    };
  }, [rules, setRules]);

  return checker;
}
