use std::ffi::{c_char, c_void, CStr, CString};
use std::sync::Arc;
use libloading::{Library, Symbol};

pub const MPV_FORMAT_NONE: i32 = 0;
pub const MPV_FORMAT_STRING: i32 = 1;
pub const MPV_FORMAT_FLAG: i32 = 3;
pub const MPV_FORMAT_INT64: i32 = 4;
pub const MPV_FORMAT_DOUBLE: i32 = 5;

pub const MPV_EVENT_NONE: i32 = 0;
pub const MPV_EVENT_SHUTDOWN: i32 = 1;
pub const MPV_EVENT_FILE_LOADED: i32 = 8;
pub const MPV_EVENT_TRACKS_CHANGED: i32 = 9;
pub const MPV_EVENT_END_FILE: i32 = 7;
pub const MPV_EVENT_PROPERTY_CHANGE: i32 = 22;

#[repr(C)]
pub struct MpvEvent {
    pub event_id: i32,
    pub error: i32,
    pub reply_userdata: u64,
    pub data: *mut c_void,
}

#[repr(C)]
pub struct MpvEventProperty {
    pub name: *const c_char,
    pub format: i32,
    pub data: *mut c_void,
}

pub type MpvHandle = *mut c_void;

pub struct MpvFunctions {
    _lib: Library,
    pub create: unsafe extern "C" fn() -> MpvHandle,
    pub initialize: unsafe extern "C" fn(handle: MpvHandle) -> i32,
    pub command: unsafe extern "C" fn(handle: MpvHandle, args: *mut *const c_char) -> i32,
    pub command_string: unsafe extern "C" fn(handle: MpvHandle, args: *const c_char) -> i32,
    pub set_option_string: unsafe extern "C" fn(handle: MpvHandle, name: *const c_char, data: *const c_char) -> i32,
    pub set_property_string: unsafe extern "C" fn(handle: MpvHandle, name: *const c_char, data: *const c_char) -> i32,
    pub get_property_string: unsafe extern "C" fn(handle: MpvHandle, name: *const c_char) -> *mut c_char,
    pub free: unsafe extern "C" fn(data: *mut c_void),
    pub observe_property: unsafe extern "C" fn(handle: MpvHandle, reply_userdata: u64, name: *const c_char, format: i32) -> i32,
    pub wait_event: unsafe extern "C" fn(handle: MpvHandle, timeout: f64) -> *mut MpvEvent,
    pub terminate_destroy: unsafe extern "C" fn(handle: MpvHandle),
}

impl MpvFunctions {
    pub fn load() -> Result<Arc<Self>, String> {
        let dll_names = ["mpv-2.dll", "libmpv-2.dll", "mpv.dll", "libmpv.dll"];
        
        let mut loaded_lib = None;
        let mut last_err = String::new();

        for name in &dll_names {
            unsafe {
                match Library::new(name) {
                    Ok(lib) => {
                        loaded_lib = Some(lib);
                        break;
                    }
                    Err(e) => {
                        last_err = e.to_string();
                    }
                }
            }
        }

        let lib = loaded_lib.ok_or_else(|| {
            format!(
                "Could not load libmpv DLL (checked mpv-2.dll, libmpv.dll). Please place mpv-2.dll in the app root or system PATH. Last error: {}",
                last_err
            )
        })?;

        unsafe {
            let create_sym: Symbol<unsafe extern "C" fn() -> MpvHandle> = lib
                .get(b"mpv_create\0")
                .map_err(|e| format!("Failed to find mpv_create: {}", e))?;
            let initialize_sym: Symbol<unsafe extern "C" fn(MpvHandle) -> i32> = lib
                .get(b"mpv_initialize\0")
                .map_err(|e| format!("Failed to find mpv_initialize: {}", e))?;
            let command_sym: Symbol<unsafe extern "C" fn(MpvHandle, *mut *const c_char) -> i32> = lib
                .get(b"mpv_command\0")
                .map_err(|e| format!("Failed to find mpv_command: {}", e))?;
            let command_string_sym: Symbol<unsafe extern "C" fn(MpvHandle, *const c_char) -> i32> = lib
                .get(b"mpv_command_string\0")
                .map_err(|e| format!("Failed to find mpv_command_string: {}", e))?;
            let set_option_string_sym: Symbol<unsafe extern "C" fn(MpvHandle, *const c_char, *const c_char) -> i32> = lib
                .get(b"mpv_set_option_string\0")
                .map_err(|e| format!("Failed to find mpv_set_option_string: {}", e))?;
            let set_property_string_sym: Symbol<unsafe extern "C" fn(MpvHandle, *const c_char, *const c_char) -> i32> = lib
                .get(b"mpv_set_property_string\0")
                .map_err(|e| format!("Failed to find mpv_set_property_string: {}", e))?;
            let get_property_string_sym: Symbol<unsafe extern "C" fn(MpvHandle, *const c_char) -> *mut c_char> = lib
                .get(b"mpv_get_property_string\0")
                .map_err(|e| format!("Failed to find mpv_get_property_string: {}", e))?;
            let free_sym: Symbol<unsafe extern "C" fn(*mut c_void)> = lib
                .get(b"mpv_free\0")
                .map_err(|e| format!("Failed to find mpv_free: {}", e))?;
            let observe_property_sym: Symbol<unsafe extern "C" fn(MpvHandle, u64, *const c_char, i32) -> i32> = lib
                .get(b"mpv_observe_property\0")
                .map_err(|e| format!("Failed to find mpv_observe_property: {}", e))?;
            let wait_event_sym: Symbol<unsafe extern "C" fn(MpvHandle, f64) -> *mut MpvEvent> = lib
                .get(b"mpv_wait_event\0")
                .map_err(|e| format!("Failed to find mpv_wait_event: {}", e))?;
            let terminate_destroy_sym: Symbol<unsafe extern "C" fn(MpvHandle)> = lib
                .get(b"mpv_terminate_destroy\0")
                .map_err(|e| format!("Failed to find mpv_terminate_destroy: {}", e))?;

            Ok(Arc::new(Self {
                create: *create_sym,
                initialize: *initialize_sym,
                command: *command_sym,
                command_string: *command_string_sym,
                set_option_string: *set_option_string_sym,
                set_property_string: *set_property_string_sym,
                get_property_string: *get_property_string_sym,
                free: *free_sym,
                observe_property: *observe_property_sym,
                wait_event: *wait_event_sym,
                terminate_destroy: *terminate_destroy_sym,
                _lib: lib,
            }))
        }
    }
}

pub struct SafeMpvInstance {
    pub handle: MpvHandle,
    pub fns: Arc<MpvFunctions>,
}

unsafe impl Send for SafeMpvInstance {}
unsafe impl Sync for SafeMpvInstance {}

impl SafeMpvInstance {
    pub fn new(fns: Arc<MpvFunctions>) -> Result<Self, String> {
        let handle = unsafe { (fns.create)() };
        if handle.is_null() {
            return Err("mpv_create returned NULL".into());
        }
        Ok(Self { handle, fns })
    }

    pub fn set_option(&self, name: &str, value: &str) -> Result<(), String> {
        let c_name = CString::new(name).map_err(|e| e.to_string())?;
        let c_value = CString::new(value).map_err(|e| e.to_string())?;
        let res = unsafe { (self.fns.set_option_string)(self.handle, c_name.as_ptr(), c_value.as_ptr()) };
        if res < 0 {
            Err(format!("set_option failed (code: {})", res))
        } else {
            Ok(())
        }
    }

    pub fn set_property(&self, name: &str, value: &str) -> Result<(), String> {
        let c_name = CString::new(name).map_err(|e| e.to_string())?;
        let c_value = CString::new(value).map_err(|e| e.to_string())?;
        let res = unsafe { (self.fns.set_property_string)(self.handle, c_name.as_ptr(), c_value.as_ptr()) };
        if res < 0 {
            Err(format!("set_property failed (code: {})", res))
        } else {
            Ok(())
        }
    }

    pub fn get_property_string(&self, name: &str) -> Option<String> {
        let c_name = CString::new(name).ok()?;
        let ptr = unsafe { (self.fns.get_property_string)(self.handle, c_name.as_ptr()) };
        if ptr.is_null() {
            None
        } else {
            let res = unsafe { CStr::from_ptr(ptr).to_string_lossy().into_owned() };
            unsafe { (self.fns.free)(ptr as *mut c_void) };
            Some(res)
        }
    }

    pub fn command(&self, cmd: &str) -> Result<(), String> {
        let c_cmd = CString::new(cmd).map_err(|e| e.to_string())?;
        let res = unsafe { (self.fns.command_string)(self.handle, c_cmd.as_ptr()) };
        if res < 0 {
            Err(format!("command failed: {} (code: {})", cmd, res))
        } else {
            Ok(())
        }
    }

    pub fn observe_property(&self, id: u64, name: &str, format: i32) -> Result<(), String> {
        let c_name = CString::new(name).map_err(|e| e.to_string())?;
        let res = unsafe { (self.fns.observe_property)(self.handle, id, c_name.as_ptr(), format) };
        if res < 0 {
            Err(format!("observe_property failed for {}", name))
        } else {
            Ok(())
        }
    }

    pub fn initialize(&self) -> Result<(), String> {
        let res = unsafe { (self.fns.initialize)(self.handle) };
        if res < 0 {
            Err(format!("mpv_initialize failed (code: {})", res))
        } else {
            Ok(())
        }
    }
}

impl Drop for SafeMpvInstance {
    fn drop(&mut self) {
        if !self.handle.is_null() {
            unsafe {
                (self.fns.terminate_destroy)(self.handle);
            }
        }
    }
}
