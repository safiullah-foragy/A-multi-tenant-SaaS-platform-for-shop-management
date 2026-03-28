const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

// Add loginRole state
code = code.replace(
  /const \[shops, setShops\] = useState\(\[\]\);\n\s*const \[loginForm, setLoginForm\] = useState\(\{ identifier: "", password: "" \}\);/,
  `const [shops, setShops] = useState([]);\n  const [loginRole, setLoginRole] = useState(null);\n  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });`
);

// Update handleLogin
code = code.replace(
  /const handleLogin = async \(event\) => \{\n\s*event\.preventDefault\(\);\n\s*setMessage\(""\);\n\s*setLoading\(true\);\n\s*try \{\n\s*const \{ data \} = await api\.post\("\/api\/auth\/login", loginForm\);\n\s*if \(data\.owner\?\.shopId !== shopId\) \{\n\s*setAuthToken\(null\);\n\s*setMessage\("This account is not the owner of the selected shop"\);\n\s*return;\n\s*\}\n\s*setAuthToken\(data\.token\);\n\s*navigate\("\/profile"\);\n\s*\} catch \(error\) \{/,
  `const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (loginRole === "owner") {
        const { data } = await api.post("/api/auth/login", loginForm);

        if (data.owner?.shopId !== shopId) {
          setAuthToken(null);
          setMessage("This account is not the owner of the selected shop");
          return;
        }

        setAuthToken(data.token);
        localStorage.setItem("userRole", "owner");
        navigate("/profile");
      } else if (loginRole === "admin" || loginRole === "cashier" || loginRole === "stockManager") {
        const route = loginRole === "admin" ? "/api/auth/admin-login" : "/api/auth/staff-login";
        const resultKey = loginRole === "admin" ? "admin" : "staff";
        
        const { data } = await api.post(route, loginForm);

        if (data[resultKey]?.shopId !== shopId) {
          setAuthToken(null);
          setMessage(\`This account is not a valid \${loginRole} of the selected shop\`);
          return;
        }
        
        if (loginRole !== "admin" && data.role !== loginRole) {
          setAuthToken(null);
          setMessage(\`This account is registered as \${data.role}, not \${loginRole}\`);
          return;
        }

        setAuthToken(data.token);
        localStorage.setItem("userRole", loginRole);
        
        if (loginRole === "admin") navigate("/admin-dashboard");
        else navigate("/profile"); // Staff views use profile typically? (or generic view, let's keep it generic)
      }
    } catch (error) {`
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
