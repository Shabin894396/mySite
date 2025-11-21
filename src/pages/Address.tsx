import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AddressForm = {
  id?: string | null;
  full_name: string;
  phone: string;
  pincode: string;
  address_line: string;
  city: string;
  state: string;
  is_default?: boolean;
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState<AddressForm[]>([]);
  const [form, setForm] = useState<AddressForm>({
    full_name: "",
    phone: "",
    pincode: "",
    address_line: "",
    city: "",
    state: "",
    is_default: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setAddresses([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); toast.error("Failed to load addresses"); setLoading(false); return; }
    setAddresses(data || []);
    setLoading(false);
  }

  function setField<K extends keyof AddressForm>(k: K, v: AddressForm[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  // Basic validation
  function validate() {
    if (!form.full_name.trim()) return "Full name is required";
    if (!/^[0-9]{10}$/.test(form.phone)) return "Phone must be 10 digits";
    if (!/^[0-9]{6}$/.test(form.pincode)) return "Pincode must be 6 digits";
    if (!form.address_line.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.state.trim()) return "State is required";
    return null;
  }

  // Pincode auto-fill (India) using public API
  async function autofillFromPincode() {
    const p = form.pincode.trim();
    if (!/^[0-9]{6}$/.test(p)) { toast.error("Enter valid 6-digit pincode"); return; }
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${p}`);
      const json = await res.json();
      if (json && Array.isArray(json) && json[0].Status === "Success") {
        const postOffice = json[0].PostOffice?.[0];
        if (postOffice) {
          setField("city", postOffice?.Division || postOffice?.District || postOffice?.Block || postOffice?.Region || "");
          setField("state", postOffice?.State || "");
          toast.success("City & state autofilled from pincode");
          return;
        }
      }
      toast.error("Could not auto-fill from pincode");
    } catch (err) {
      console.error(err);
      toast.error("Pincode lookup failed");
    }
  }

  async function handleSaveAddress() {
    const err = validate();
    if (err) { toast.error(err); return; }

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { toast.error("Please login"); setSaving(false); return; }

    const payload = {
      ...form,
      user_id: userData.user.id,
      is_default: !!form.is_default,
      id: editingId ?? undefined
    };

    // Upsert: if editing use upsert, will honor trigger to clear other defaults
    const { error } = await supabase.from("addresses").upsert(payload, { returning: "representation" });

    if (error) {
      console.error(error);
      toast.error("Failed to save address");
      setSaving(false);
      return;
    }

    toast.success("Address saved");
    setForm({
      full_name: "",
      phone: "",
      pincode: "",
      address_line: "",
      city: "",
      state: "",
      is_default: false
    });
    setEditingId(null);
    await loadAddresses();
    setSaving(false);
  }

  function startEdit(a: AddressForm) {
    setEditingId(a.id ?? null);
    setForm({
      id: a.id ?? undefined,
      full_name: a.full_name,
      phone: a.phone,
      pincode: a.pincode,
      address_line: a.address_line,
      city: a.city,
      state: a.state,
      is_default: !!a.is_default,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete address?")) return;
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Address removed");
    loadAddresses();
  }

  async function setDefault(id: string) {
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    if (error) { toast.error("Failed to set default"); return; }
    toast.success("Default address set");
    loadAddresses();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">{editingId ? "Edit Address" : "Add Address"}</h2>

              <div className="grid grid-cols-1 gap-3">
                <Input placeholder="Full name" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} />
                <Input placeholder="Phone (10 digits)" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                <div className="flex gap-2">
                  <Input placeholder="Pincode" value={form.pincode} onChange={(e) => setField("pincode", e.target.value)} />
                  <Button variant="outline" onClick={autofillFromPincode}>Auto-fill</Button>
                </div>
                <Input placeholder="Address line" value={form.address_line} onChange={(e) => setField("address_line", e.target.value)} />
                <div className="flex gap-2">
                  <Input placeholder="City" value={form.city} onChange={(e) => setField("city", e.target.value)} />
                  <Input placeholder="State" value={form.state} onChange={(e) => setField("state", e.target.value)} />
                </div>

                <div className="flex items-center gap-2">
                  <input id="default" type="checkbox" checked={!!form.is_default} onChange={(e) => setField("is_default", e.target.checked)} />
                  <label htmlFor="default">Make default</label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveAddress} disabled={saving}>{saving ? "Saving..." : "Save Address"}</Button>
                  <Button variant="outline" onClick={() => { setForm({ full_name: "", phone: "", pincode: "", address_line: "", city: "", state: "", is_default: false }); setEditingId(null); }}>Clear</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-2">Saved Addresses</h3>
            <div className="space-y-4">
              {loading ? <p>Loading...</p> : addresses.length === 0 ? <p>No saved addresses yet.</p> :
                addresses.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <p className="font-medium">{a.full_name} {a.is_default && <span className="text-sm text-green-600">• Default</span>}</p>
                        <p className="text-sm text-muted-foreground">{a.address_line}, {a.city}, {a.state} - {a.pincode}</p>
                        <p className="text-sm text-muted-foreground">Phone: {a.phone}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => startEdit(a)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id!)}>Delete</Button>
                        </div>
                        {!a.is_default && <Button size="sm" variant="outline" onClick={() => setDefault(a.id!)}>Set default</Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
