<template>
    <el-drawer v-model="visible" :title="drawerTitle" size="520px" destroy-on-close>
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
            <el-form-item v-if="mode === 'create'" label="用户 ID" prop="userid">
                <el-input v-model.trim="formData.userid" placeholder="请输入 Keycloak 用户 ID" clearable />
                <div class="field-hint">必须与统一认证中的用户标识一致，创建后不可修改。</div>
            </el-form-item>

            <el-form-item v-else label="用户 ID">
                <el-input :model-value="model?.userid" disabled />
            </el-form-item>

            <el-form-item label="显示名称" prop="username">
                <el-input v-model.trim="formData.username" placeholder="请输入显示名称" clearable />
            </el-form-item>

            <el-form-item v-if="mode === 'edit'" label="状态">
                <el-radio-group v-model="formData.status">
                    <el-radio-button value="Active">启用</el-radio-button>
                    <el-radio-button value="Disabled">禁用</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="权限组">
                <el-select
                    v-model="formData.groupCodes"
                    multiple
                    filterable
                    clearable
                    placeholder="请选择权限组（可留空）"
                    :loading="groupLoading"
                    style="width: 100%"
                >
                    <el-option v-for="option in groupOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="drawer-footer">
                <el-button @click="visible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    {{ mode === 'create' ? '创建账号' : '保存修改' }}
                </el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createAdmin, getGroupIndex, updateAdmin, type AdminItem } from '/@/api/backend/rbac'

interface Props {
    modelValue: boolean
    mode: 'create' | 'edit'
    model: AdminItem | null
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    mode: 'create',
    model: null,
})
const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
    (event: 'submit'): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})
const drawerTitle = computed(() => (props.mode === 'create' ? '新增管理员' : `编辑管理员：${props.model?.username ?? ''}`))

const formRef = ref()
const submitting = ref(false)
const groupLoading = ref(false)
const groupOptions = ref<{ label: string; value: string }[]>([])
const formData = reactive({
    userid: '',
    username: '',
    status: 'Active' as 'Active' | 'Disabled',
    groupCodes: [] as string[],
})
const formRules = computed(() => ({
    userid: props.mode === 'create' ? [{ required: true, message: '请输入用户 ID', trigger: 'blur' }] : [],
    username: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
}))

async function loadGroupOptions() {
    groupLoading.value = true
    try {
        const result = (await getGroupIndex({ select: true })) as any
        const options = Array.isArray(result?.options) ? result.options : []
        groupOptions.value = options.map((item: any) => ({
            value: String(item.groupCode ?? item.id),
            label: String(item.groupName ?? item.name)
                .replace(/^[\s└─├│]+/, '')
                .trim(),
        }))
    } catch {
        groupOptions.value = []
    } finally {
        groupLoading.value = false
    }
}

watch(
    () => [props.modelValue, props.mode, props.model],
    () => {
        if (!props.modelValue) return
        loadGroupOptions()
        formData.userid = props.mode === 'edit' ? props.model?.userid ?? '' : ''
        formData.username = props.mode === 'edit' ? props.model?.username ?? '' : ''
        formData.status = props.mode === 'edit' ? props.model?.status ?? 'Active' : 'Active'
        formData.groupCodes = props.mode === 'edit' ? [...(props.model?.groupCodes ?? [])] : []
    },
    { immediate: true }
)

async function handleSubmit() {
    try {
        await formRef.value?.validate()
    } catch {
        return
    }

    submitting.value = true
    try {
        if (props.mode === 'create') {
            await createAdmin({
                userid: formData.userid,
                username: formData.username,
                groupCode: formData.groupCodes.length ? formData.groupCodes : undefined,
            })
            ElMessage.success('管理员账号已创建')
        } else if (props.model) {
            await updateAdmin(props.model.userid, {
                username: formData.username,
                status: formData.status,
                groupArr: formData.groupCodes,
            })
            ElMessage.success('管理员信息已更新')
        }
        emit('submit')
        visible.value = false
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.field-hint {
    margin-top: 6px;
    color: var(--cochain-text-secondary);
    font-size: 12px;
    line-height: 1.5;
}

.drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>
