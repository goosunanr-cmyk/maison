-- 禁用所有表的RLS（快速测试用）
ALTER TABLE dishes DISABLE ROW LEVEL SECURITY;
ALTER TABLE selected_dishes DISABLE ROW LEVEL SECURITY;
ALTER TABLE confirmed_menus DISABLE ROW LEVEL SECURITY;

-- 如果想重新启用RLS并设置开放策略，可以用下面的：
/*
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmed_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON dishes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON dishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON dishes FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON dishes FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON selected_dishes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON selected_dishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON selected_dishes FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON selected_dishes FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON confirmed_menus FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON confirmed_menus FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON confirmed_menus FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON confirmed_menus FOR DELETE USING (true);
*/
